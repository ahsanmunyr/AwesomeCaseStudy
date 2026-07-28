import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import { I18nManager } from "react-native";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

export type Language = "en" | "ar";

/** Every key that exists in en.json, for example "app.title". */
export type TranslationKey = keyof typeof en;

/** Values put into a text placeholder, e.g. { total: 4305 }. */
export type TranslationParams = Record<string, string | number>;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: "en",
  // If a key is missing from Arabic, show the English text instead of the key.
  fallbackLng: "en",
  // Our keys already contain dots ("app.title"), so i18next must not read a
  // dot as "go one level deeper into the file".
  keySeparator: false,
  interpolation: {
    // React escapes text by itself, so i18next does not need to do it again.
    escapeValue: false,
  },
  react: {
    // No <Suspense> wrapper needed: all the text is bundled with the app.
    useSuspense: false,
  },
});

/**
 * Arabic is written right to left. Our own components flip their text direction
 * immediately; mirroring the whole native layout only takes effect after the
 * app restarts, which is a React Native limitation, not a bug here.
 */
i18n.on("languageChanged", language => {
  const shouldBeRTL = language === "ar";
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
  }
});

// Re-exported from here so that importing the hook also runs the setup above.
export { useTranslation } from "react-i18next";

/**
 * True while the app is showing a right-to-left language.
 *
 * We read the direction from i18next rather than from React Native's
 * I18nManager, because I18nManager only mirrors the layout after the app is
 * restarted. This flips the layout straight away, as soon as the user taps the
 * language button.
 */
export function useIsRTL(): boolean {
  const { i18n: instance } = useTranslation();
  return instance.dir() === "rtl";
}

export default i18n;
