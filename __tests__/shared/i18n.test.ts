import i18n, { TranslationKey } from "../../src/shared/i18n";
import en from "../../src/shared/i18n/locales/en.json";
import ar from "../../src/shared/i18n/locales/ar.json";

/** Switches language and returns i18next's t function for that language. */
async function useLanguage(language: "en" | "ar") {
  await i18n.changeLanguage(language);
  return i18n.t;
}

describe("translating", () => {
  it("returns the English text", async () => {
    const t = await useLanguage("en");

    expect(t("app.title")).toBe("Hearthstone Cards");
  });

  it("returns the Arabic text", async () => {
    const t = await useLanguage("ar");

    expect(t("app.title")).toBe("بطاقات هيرثستون");
  });

  it("fills in the placeholders", async () => {
    const t = await useLanguage("en");

    expect(t("list.progress", { loaded: 24, total: 4305 })).toBe("24 of 4305 loaded");
    expect(t("card.stats", { attack: 4, health: 5 })).toBe("4 ATK / 5 HP");
  });

  it("uses the name the server sent when a slug has no translation", async () => {
    const t = await useLanguage("ar");

    expect(t("cardTypes.minion" as TranslationKey, { defaultValue: "Minion" })).toBe("تابع");
    expect(t("cardTypes.brand-new" as TranslationKey, { defaultValue: "Brand New" })).toBe("Brand New");
  });
});

describe("text direction", () => {
  it("is right to left for Arabic and left to right for English", async () => {
    await i18n.changeLanguage("ar");
    expect(i18n.dir()).toBe("rtl");

    await i18n.changeLanguage("en");
    expect(i18n.dir()).toBe("ltr");
  });
});

describe("the locale files", () => {
  it("have exactly the same keys in both languages", () => {
    expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort());
  });

  it("have no empty text", () => {
    const allTexts: string[] = [...Object.values(en), ...Object.values(ar)];

    expect(allTexts.every(text => text.trim().length > 0)).toBe(true);
  });
});
