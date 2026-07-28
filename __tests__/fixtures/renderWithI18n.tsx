import React from "react";
import { render } from "@testing-library/react-native";
import { I18nProvider, Language } from "../../src/shared/i18n";

/**
 * Renders inside a real I18nProvider so tests assert on the strings users
 * actually see, and a missing locale key fails the test rather than passing
 * against a stubbed translator.
 */
export function renderWithI18n(ui: React.ReactElement, language: Language = "en") {
  return render(<I18nProvider initialLanguage={language}>{ui}</I18nProvider>);
}

export default renderWithI18n;
