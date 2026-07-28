/**
 * Hearthstone card browser.
 *
 * @format
 */

import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import MainScreen from "./src/screens/MainScreen/MainScreen";
import colors from "./src/theme/colors";
import { I18nProvider } from "./src/shared/i18n";

function App() {
  return (
    <I18nProvider initialLanguage="en">
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <MainScreen />
      </SafeAreaProvider>
    </I18nProvider>
  );
}

export default App;
