import en from "../../src/shared/i18n/locales/en.json";
import ar from "../../src/shared/i18n/locales/ar.json";

function placeholdersIn(value: string): string[] {
  return (value.match(/{{\s*\w+\s*}}/g) ?? []).sort();
}

const arabic: Record<string, string> = ar;

describe("the locale files", () => {
  it("stay in step: Arabic defines every English key, adds none, and keeps every placeholder", () => {
    expect(Object.keys(arabic).sort()).toEqual(Object.keys(en).sort());

    for (const [key, english] of Object.entries(en)) {
      expect(placeholdersIn(arabic[key])).toEqual(placeholdersIn(english));
    }
  });
});
