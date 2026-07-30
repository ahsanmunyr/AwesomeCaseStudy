import React from "react";
import { render } from "@testing-library/react-native";
import i18n, { Language } from "../../src/shared/i18n";

export async function renderWithI18n(ui: React.ReactElement, language: Language = "en") {
  await i18n.changeLanguage(language);
  return render(ui);
}

export default renderWithI18n;
