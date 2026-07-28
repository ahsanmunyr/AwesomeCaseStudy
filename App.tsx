/**
 * Hearthstone card browser.
 *
 * @format
 */

import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
// Sets i18next up before anything renders. No provider is needed around the
// app: i18next is a single instance, and useTranslation() reads from it.
import "./src/shared/i18n";
import MainScreen from "./src/screens/MainScreen/MainScreen";
import colors from "./src/theme/colors";

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <MainScreen />
    </SafeAreaProvider>
  );
}

export default App;
