import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
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
