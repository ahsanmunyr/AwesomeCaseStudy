import { Card, CardSet, CardWithId, CardsPage, HearthstoneResponse } from "../../types/heartstone-api/type";

/** The parts of a card a test may want to change. */
interface CardOverrides {
  slug?: string;
  name?: string;
  type?: { slug: string; name: string };
  cardClass?: { slug: string; name: string };
  rarity?: { slug: string; name: string };
  manaCost?: number;
  attack?: number;
  health?: number;
  cardSetSlug?: string;
  copyOfCardId?: number;
}

function makeCardSet(slug?: string): CardSet | null {
  if (!slug) {
    return null;
  }
  return {
    name: slug,
    slug,
    type: "expansion",
    collectibleCount: 0,
    collectibleRevealedCount: 0,
    nonCollectibleCount: 0,
    nonCollectibleRevealedCount: 0,
  };
}

/**
 * A card exactly as the API sends it, with no id. Only the service test needs
 * this shape; everywhere else the service has already added the id.
 */
export function makeCard(overrides: CardOverrides = {}): Card {
  const type = overrides.type ?? { slug: "spell", name: "Spell" };
  const cardClass = overrides.cardClass ?? { slug: "mage", name: "Mage" };
  const rarity = overrides.rarity ?? { slug: "common", name: "Common" };

  return {
    collectible: 1,
    slug: overrides.slug ?? "fireball",
    name: overrides.name ?? "Fireball",
    artistName: "Test Artist",
    manaCost: overrides.manaCost ?? 4,
    text: "Deal 6 damage.",
    flavorText: "This spell is useful for burning things.",
    hasImage: true,
    hasImageGold: false,
    hasCropImage: true,
    keywords: [],
    rarity: { ...rarity, craftingCost: [40, 400], dustValue: [5, 50] },
    class: cardClass,
    type: { ...type, gameModes: [] },
    cardSet: makeCardSet(overrides.cardSetSlug),
    spellSchool: null,
    attack: overrides.attack,
    health: overrides.health,
    copyOfCardId: overrides.copyOfCardId,
  };
}

/**
 * The same card after the service has given it an id. The id is the card's
 * position in the loaded list, so fixtures used together need different ones.
 */
export function makeCardWithId(overrides: CardOverrides = {}, id: string = "0"): CardWithId {
  return { ...makeCard(overrides), id };
}

export const MINION = makeCardWithId({
  slug: "chillwind-yeti",
  name: "Chillwind Yeti",
  type: { slug: "minion", name: "Minion" },
  cardClass: { slug: "neutral", name: "Neutral" },
  rarity: { slug: "common", name: "Common" },
  manaCost: 4,
  attack: 4,
  health: 5,
});

export const SPELL = makeCardWithId(
  {
    slug: "fireball",
    name: "Fireball",
    type: { slug: "spell", name: "Spell" },
    cardClass: { slug: "mage", name: "Mage" },
    rarity: { slug: "common", name: "Common" },
  },
  "1",
);

export const LEGENDARY_MINION = makeCardWithId(
  {
    slug: "ragnaros",
    name: "Ragnaros the Firelord",
    type: { slug: "minion", name: "Minion" },
    cardClass: { slug: "neutral", name: "Neutral" },
    rarity: { slug: "legendary", name: "Legendary" },
    manaCost: 8,
    attack: 8,
    health: 8,
  },
  "2",
);

/** Sits on the second page in the tests, hence the id after LEGENDARY_MINION. */
export const WEAPON = makeCardWithId(
  {
    slug: "fiery-war-axe",
    name: "Fiery War Axe",
    type: { slug: "weapon", name: "Weapon" },
    cardClass: { slug: "warrior", name: "Warrior" },
    rarity: { slug: "epic", name: "Epic" },
  },
  "3",
);

/**
 * One page as the app sees it, i.e. after the service added the ids.
 * 4305 cards over 359 pages, like the real API.
 */
export function makeResponse(cards: CardWithId[], overrides: Partial<CardsPage> = {}): CardsPage {
  return {
    cards,
    cardCount: 4305,
    pageCount: 359,
    page: "1",
    ...overrides,
  };
}

/** One page exactly as the API sends it, with no ids. For the service test. */
export function makeRawResponse(cards: Card[], overrides: Partial<HearthstoneResponse> = {}): HearthstoneResponse {
  return {
    cards,
    cardCount: 4305,
    pageCount: 359,
    page: "1",
    ...overrides,
  };
}
