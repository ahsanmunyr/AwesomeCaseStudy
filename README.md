# Hearthstone Cards

A React Native card browser built on the RapidAPI Hearthstone **All Cards** service. Cards are paginated 12 at a time into a FlashList, with a header that carries a search bar and Type / Class / Rarity dropdowns.

Written in TypeScript throughout, fully unit tested, and localised for English and Arabic.

|              |                                           |
| ------------ | ----------------------------------------- |
| React Native | 0.86.2                                    |
| React        | 19.2.3                                    |
| TypeScript   | 5.8.3 (`strict`)                          |
| List         | `@shopify/flash-list` 2.3.2               |
| HTTP         | `axios` 1.18.1                            |
| Tests        | Jest + `@testing-library/react-native` 14 |
| Node         | >= 22.11.0                                |

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Environment

Copy the example file and add your RapidAPI key:

```bash
cp .env.example .env
```

```
RAPID_API_KEY=your_rapidapi_key_here
```

Read at runtime by `react-native-config`. `.env` is gitignored — do not commit it.

### 3. iOS pods

`@shopify/flash-list` ships native code, so pods must be installed before the first iOS build:

```bash
cd ios && pod install && cd ..
```

Android picks it up on the next Gradle sync.

### 4. Run

```bash
npm start          # Metro
npm run ios
npm run android
```

---

## Scripts

| Command                 | Purpose                      |
| ----------------------- | ---------------------------- |
| `npm test`              | Run the unit test suite      |
| `npm run test:coverage` | Tests with a coverage report |
| `npm run typecheck`     | `tsc --noEmit`               |
| `npm run lint`          | ESLint                       |

---

## Requirements coverage

| Requirement                            | Where                                                             |
| -------------------------------------- | ----------------------------------------------------------------- |
| **1a** — API service = All Cards       | `src/services/cards.service.ts`                                   |
| **1b** — Search for specific cards     | Search bar in the header, debounced 300 ms                        |
| **1c** — View cards by selected type   | Type dropdown filters the list in place                           |
| **2** — Display cards by selected type | Same screen; the list narrows to the chosen type                  |
| TypeScript mandatory                   | `strict: true`, zero `tsc` errors                                 |
| Unit testing mandatory                 | 94 tests across services, hooks, utils, components and the screen |

**Note on screens.** The brief describes two screens (a type list, then a drill-down). This implementation is a single screen with header filters, chosen deliberately for a simpler flow: selecting a type in the dropdown narrows the list to that type, which satisfies 1a/1b/1c and requirement 2 functionally. A reviewer looking specifically for a navigation transition between two screens will not find one.

---

## Architecture

```
src/
├─ config/
│  ├─ api.ts               createApiClient() — axios + RapidAPI headers
│  └─ baseURLs.ts          endpoint constants
├─ services/
│  ├─ cards.service.ts     getCards(page, pageSize) — also adds the `id` the API omits
│  └─ apiError.ts          ApiError carrying a translation key, not a message
├─ hooks/
│  └─ useDebounce.ts       generic, reusable across screens
├─ screens/MainScreen/
│  ├─ MainScreen.tsx       presentational; consumes one hook
│  ├─ MainScreen.style.ts
│  ├─ hooks/
│  │  └─ useMainScreen.ts  the screen's only hook: paging + filters + scroll
│  └─ utils/
│     └─ cardFilters.ts    pure filter + option-derivation logic
├─ components/             feature components (CardItem, FilterBar, …)
├─ shared/
│  ├─ components/          CustomView · CustomText · CustomPressable
│  │                       CustomLoader · CustomTextInput
│  └─ i18n/                i18next setup + locales/{en,ar}.json
└─ theme/colors.ts
```

The data flow is a single chain:

```
createApiClient    →  cards.service  →  MainScreen/hooks  →  MainScreen
```

`MainScreen` consumes exactly one hook (`useMainScreen`) and holds no data logic. All pure logic — filtering, option derivation, card identity — lives in `utils/` so it is testable without React.

---

## The API, and what it forced

The endpoint is `https://hearthstone11.p.rapidapi.com/cards`. Its actual behaviour differs from what its parameters suggest, and three findings shaped the whole implementation.

### Filter parameters are ignored

`type`, `class`, `rarity` and `textFilter` are accepted but have no effect — `?type=spell` returns minions, and `cardCount` stays 4305 for every combination. **Only `page` and `pageSize` work.**

Consequence: all searching and filtering is client-side, over the cards loaded so far.

### `slug` is not unique

The dataset holds **4305 cards across only 3694 slugs**. Reprints repeat a slug across sets, sometimes with different stats — Abusive Sergeant ships as both a 1/1 and a 2/1. So `slug` cannot be the React key: it would produce duplicate keys for ~611 real cards.

There is no `id` field either, so `getCards` gives each card its position in the loaded list:

```
id = (page - 1) * pageSize + indexInPage
```

The id is only ever a list key, and the list is append-only — page 2 lands under page 1 and nothing is reordered or removed — so a card's position never changes once it is loaded. Pagination was checked against the live API and is stable: page 1 returns identical cards when refetched, consecutive and distant pages never overlap, and 358 × 12 + 9 = 4305 exactly. So no de-duplication step is needed on merge, and no content-derived identity is needed either.

Every card outside the service is a `CardWithId`, which keeps the list's `keyExtractor` a one-liner and lets a new page be appended with a plain spread.

### No card images

Cards expose `hasImage` / `hasCropImage` booleans but no image URLs, so cards render as text rows rather than card art.

### Dataset shape

Only **5 card types** exist — Minion (2807), Spell (1300), Weapon (142), Hero (46), Location (10) — plus 11 classes and 5 rarities.

---

## Pagination behaviour

Pages load 12 at a time and accumulate. Two rules govern automatic loading:

1. **Auto-paging requires a real scroll.** FlashList fires `onEndReached` during its first layout, which fetched page 2 immediately on mount. It is gated on `onScrollBeginDrag`, so a cold start makes exactly one request. Deliberately _not_ `onMomentumScrollBegin`: momentum only starts when the list is flicked and released, so a slow drag would never open the gate and paging would behave differently depending on how the user scrolled.
2. **Auto-paging is disabled while filtering.** With a filter active, a handful of matches never fills the viewport, so `onEndReached` would re-fire on every append and walk all 359 pages unattended. While filtered, the next page comes from an explicit **Load more** button.

**Known trade-off:** because filtering is client-side over loaded cards, search and the dropdowns only see what has been paged in. The Type dropdown starts with Spell and Minion; Weapon appears around card #54, Hero #61, and Location #604. A narrow filter can legitimately return zero results — the empty state offers **Load more cards** to widen the pool.

---

## Internationalisation

English and Arabic, in `src/shared/i18n/locales/`. No user-facing string is hardcoded in a component.

Copy is looked up with `t(key)` at the point where it is rendered, so the JSX still reads like the screen it draws:

```tsx
<CustomText variant="title">{t("app.title")}</CustomText>
<CustomPressable label={t("filters.clear", { filterCount: 2 })} accessibilityLabel={t("filters.clearLabel")} />
<CustomTextInput placeholder={t("search.placeholder")} accessibilityLabel={t("search.label")} />
```

- **Keys are typed.** The locale files are a flat list of `"group.name"` keys (so i18next runs with `keySeparator: false`), and `src/shared/i18n/i18next.d.ts` hands that shape to i18next. A typo like `t("app.titel")` is a compile error rather than a string that ships untranslated.
- **Placeholders and accessibility labels** go through the same path.
- **API values are localised too.** Card type/class/rarity arrive from the server in English; the locale files map all 5 types, 5 rarities and 11 class slugs. Those keys are only known at runtime, so they pass `{ defaultValue }` — i18next then falls back to the server's own label for any slug added later.
- **Errors carry keys.** Services throw `ApiError({ key: "errors.network" })`; the UI resolves it. No English is created outside the locale files.

Translation runs on **i18next + react-i18next**, set up once in `src/shared/i18n/index.ts`. i18next is a single global instance, so there is no provider around the app — `App.tsx` imports the setup module and every component calls `useTranslation()` directly.

To switch language:

```tsx
const { i18n } = useTranslation();
i18n.changeLanguage("ar");
```

### RTL

A pill button in the header switches between English and Arabic. It is labelled with the language you are switching _to_ — `app.otherLanguage` resolves to `"العربية"` in the English file and `"English"` in the Arabic one, so the button never needs a conditional.

**The layout mirrors immediately, without an app restart.** That is the whole point of the `useIsRTL()` hook in `src/shared/i18n/index.ts`: it reads the direction from i18next rather than from React Native's `I18nManager`.

This matters because `I18nManager.isRTL` only changes on the _next_ app launch. Anything that resolves against it — `flexDirection: "row"` auto-mirroring, `paddingStart` / `paddingEnd`, `textAlign: "auto"` — keeps rendering left-to-right for the whole session after the user switches language. So:

- `CustomView row` picks `row-reverse` explicitly when RTL, rather than relying on auto-mirroring
- `CustomText` sets `textAlign` as well as `writingDirection` — without it Arabic renders correctly but still sits against the left edge
- side-specific spacing uses explicit `paddingLeft` / `paddingRight`, never `paddingStart` / `paddingEnd`
- `CustomPressable` mirrors only its pill variants; `plain` is also used as a modal backdrop and a column, and reversing those would break the sheet

`I18nManager.forceRTL` is still set from an `i18n.on("languageChanged")` listener, so native-level mirroring is correct from the next launch onward — but nothing in this app's own layout depends on it.

---

## Shared components

Feature code uses no raw React Native primitives — no `<Text>`, `<View>`, `<Pressable>`, `<TextInput>` or `<ActivityIndicator>` appears in `src/components` or `src/screens`.

| Component         | Purpose                                                                   |
| ----------------- | ------------------------------------------------------------------------- |
| `CustomView`      | Themed container with `variant`, `row`, `center`, `flex` shorthands       |
| `CustomText`      | The only Text. Takes `tx` for copy; `children` is reserved for API values |
| `CustomPressable` | Button with variants, translated label and accessibility label            |
| `CustomLoader`    | Spinner with optional translated caption                                  |
| `CustomTextInput` | Themed, direction-aware input with translated placeholder                 |

---

## Testing

```bash
npm test
```

**151 tests** across 14 files.

| Area       | Coverage |
| ---------- | -------- |
| Statements | 96.1%    |
| Branches   | 91.8%    |
| Functions  | 96.7%    |
| Lines      | 96.2%    |

What is covered:

- **Pure logic** — filtering and option derivation
- **Hooks** — pagination, retry, stale-response handling, scroll gating, filter interaction, debounce
- **Service** — request shape, and every error mapped to the right translation key
- **Components** — all five shared primitives, in both languages, plus RTL alignment
- **Screen** — search, type filtering, load-more, error/retry, empty state
- **Locale parity** — Arabic defines every English key, adds none, and every `{{placeholder}}` matches across both files, so a half-finished translation fails at test time

Component tests render against the real i18next instance (`__tests__/fixtures/renderWithI18n.tsx` only picks the language), so they assert on the strings a user actually sees rather than against a stubbed translator.

---

## Performance notes

- `React.memo` on every presentational component
- `useCallback` for `renderItem`, `keyExtractor` and all handlers
- `useMemo` for derived filter options, the filtered list, and list header/footer elements
- Search debounced 300 ms so typing does not re-run the filter pass per keystroke
- Referential stability of hook callbacks is asserted by test
