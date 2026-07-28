import React from "react";
import { render } from "@testing-library/react-native";
import i18n, { Language } from "../../src/shared/i18n";

/**
 * Renders with the real i18next instance, so tests check the strings a user
 * actually sees and a missing locale key fails the test.
 *
 * There is no provider to wrap: importing our i18n module sets i18next up, and
 * we only have to pick the language for this test.
 */
export async function renderWithI18n(ui: React.ReactElement, language: Language = "en") {
  await i18n.changeLanguage(language);
  return render(ui);
}

export default renderWithI18n;
