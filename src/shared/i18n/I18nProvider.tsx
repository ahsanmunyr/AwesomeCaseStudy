import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { I18nManager } from "react-native";
import { Language, TranslationKey, TranslationParams, isRTLLanguage, translate, translateOptional } from "./translate";

export interface I18nContextValue {
  language: Language;
  isRTL: boolean;
  /** Translates a known key. Unknown keys are a TypeScript error. */
  t: (key: TranslationKey, params?: TranslationParams) => string;
  /** Translates an API-sourced slug, falling back to the server's own label. */
  tApi: (key: string, fallback: string, params?: TranslationParams) => string;
  setLanguage: (language: Language) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface Props {
  children: React.ReactNode;
  initialLanguage?: Language;
}

export const I18nProvider = ({ children, initialLanguage = "en" }: Props) => {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    // Text direction is applied immediately by the Custom* components. Full
    // layout mirroring is a native concern and only takes effect after the app
    // is reloaded, which is why this is not awaited or relied upon for render.
    const shouldBeRTL = isRTLLanguage(next);
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
    }
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      isRTL: isRTLLanguage(language),
      t: (key, params) => translate(language, key, params),
      tApi: (key, fallback, params) => translateOptional(language, key, fallback, params),
      setLanguage,
    }),
    [language, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used inside an I18nProvider.");
  }
  return context;
}

export default I18nProvider;
