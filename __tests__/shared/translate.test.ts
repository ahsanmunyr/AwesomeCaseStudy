import en from "../../src/shared/i18n/locales/en.json";
import ar from "../../src/shared/i18n/locales/ar.json";
import { interpolate, isRTLLanguage, translate, translateOptional } from "../../src/shared/i18n";

/** Flattens a locale object into dot-separated key paths. */
function keyPaths(node: unknown, prefix = ""): string[] {
  if (typeof node === "string") {
    return [prefix];
  }
  if (node && typeof node === "object") {
    return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) => keyPaths(value, prefix ? `${prefix}.${key}` : key));
  }
  return [];
}

describe("locale files", () => {
  it("Arabic defines every key that English defines", () => {
    const missing = keyPaths(en).filter(key => !keyPaths(ar).includes(key));
    expect(missing).toEqual([]);
  });

  it("Arabic adds no keys English does not have", () => {
    const extra = keyPaths(ar).filter(key => !keyPaths(en).includes(key));
    expect(extra).toEqual([]);
  });

  it("every placeholder in an English string also appears in the Arabic one", () => {
    const placeholders = (value: string) => (value.match(/\{\{(\w+)\}\}/g) ?? []).sort();

    for (const key of keyPaths(en)) {
      const english = translate("en", key as never);
      const arabic = translate("ar", key as never);
      expect({ key, params: placeholders(arabic) }).toEqual({ key, params: placeholders(english) });
    }
  });

  it("has no empty translations", () => {
    for (const key of keyPaths(ar)) {
      expect(translate("ar", key as never).trim().length).toBeGreaterThan(0);
    }
  });
});

describe("interpolate", () => {
  it("returns the template untouched with no params", () => {
    expect(interpolate("Load more")).toBe("Load more");
  });

  it("substitutes named placeholders", () => {
    expect(interpolate("{{loaded}} of {{total}} loaded", { loaded: 12, total: 4305 })).toBe("12 of 4305 loaded");
  });

  it("leaves unknown placeholders in place rather than printing undefined", () => {
    expect(interpolate("{{a}} and {{b}}", { a: 1 })).toBe("1 and {{b}}");
  });
});

describe("translate", () => {
  it("resolves a nested key", () => {
    expect(translate("en", "app.title")).toBe("Hearthstone Cards");
  });

  it("resolves the Arabic string for the same key", () => {
    expect(translate("ar", "app.title")).toBe("بطاقات هيرثستون");
  });

  it("interpolates params", () => {
    expect(translate("en", "list.progress", { loaded: 12, total: 4305 })).toBe("12 of 4305 loaded");
  });
});

describe("translateOptional", () => {
  it("uses the locale value when the slug is known", () => {
    expect(translateOptional("ar", "cardTypes.minion", "Minion")).toBe("تابع");
  });

  it("falls back to the API name for an unknown slug", () => {
    expect(translateOptional("ar", "cardTypes.brand-new", "Brand New")).toBe("Brand New");
  });
});

describe("isRTLLanguage", () => {
  it("marks Arabic as RTL and English as LTR", () => {
    expect(isRTLLanguage("ar")).toBe(true);
    expect(isRTLLanguage("en")).toBe(false);
  });
});
