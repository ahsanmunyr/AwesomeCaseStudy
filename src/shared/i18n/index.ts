import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import { I18nManager } from "react-native";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

export type Language = "en" | "ar";

export type TranslationKey = keyof typeof en;

export type TranslationParams = Record<string, string | number>;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: "en",
  fallbackLng: "en",
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

i18n.on("languageChanged", language => {
  const shouldBeRTL = language === "ar";
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
  }
});

export { useTranslation } from "react-i18next";

export function useIsRTL(): boolean {
  const { i18n: instance } = useTranslation();
  return instance.dir() === "rtl";
}

export default i18n;
