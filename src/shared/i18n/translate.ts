import en from "./locales/en.json";
import ar from "./locales/ar.json";

export type Language = "en" | "ar";

export const LANGUAGES: Language[] = ["en", "ar"];

export const RTL_LANGUAGES: Language[] = ["ar"];

export const resources = { en, ar } as const;

export type TranslationParams = Record<string, string | number>;

/**
 * Dot-separated paths into the locale files, derived from en.json so a missing
 * or renamed key is a compile error rather than a string that ships untranslated.
 */
type Leaves<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = Leaves<typeof en>;

function lookup(language: Language, key: string): string | undefined {
  const value = key.split(".").reduce<unknown>((node, part) => {
    if (node && typeof node === "object" && part in (node as Record<string, unknown>)) {
      return (node as Record<string, unknown>)[part];
    }
    return undefined;
  }, resources[language]);

  return typeof value === "string" ? value : undefined;
}

/** Replaces every `{{name}}` placeholder with the matching param. */
export function interpolate(template: string, params?: TranslationParams): string {
  if (!params) {
    return template;
  }
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

/**
 * Resolves `key` for `language`, falling back to English so a gap in a
 * translation file degrades to readable text instead of a raw key.
 */
export function translate(language: Language, key: TranslationKey, params?: TranslationParams): string {
  const template = lookup(language, key) ?? lookup("en", key);
  return template === undefined ? key : interpolate(template, params);
}

/**
 * For values that come from the API (card type/class/rarity slugs). Falls back
 * to the server's English name when a slug has no translation yet.
 */
export function translateOptional(language: Language, key: string, fallback: string, params?: TranslationParams): string {
  const template = lookup(language, key) ?? lookup("en", key);
  return template === undefined ? fallback : interpolate(template, params);
}

export function isRTLLanguage(language: Language): boolean {
  return RTL_LANGUAGES.includes(language);
}
