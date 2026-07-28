import React, { memo } from "react";
import { ActivityIndicator, ActivityIndicatorProps, StyleSheet } from "react-native";
import colors from "../../theme/colors";
import CustomText from "./CustomText";
import CustomView from "./CustomView";
import { TranslationKey } from "../i18n";

export interface CustomLoaderProps extends Omit<ActivityIndicatorProps, "color"> {
  /** Optional caption rendered under the spinner. */
  tx?: TranslationKey;
  color?: string;
  /** Fills the available space and centres itself. */
  fullscreen?: boolean;
}

const CustomLoader = ({ tx, size = "small", color = colors.accent, fullscreen, testID, ...rest }: CustomLoaderProps) => (
  <CustomView testID={testID} center flex={fullscreen} style={styles.container}>
    <ActivityIndicator size={size} color={color} {...rest} />
    {tx ? <CustomText variant="subtitle" tx={tx} style={styles.caption} /> : null}
  </CustomView>
);

const styles = StyleSheet.create({
  container: { paddingVertical: 20, gap: 12 },
  caption: { textAlign: "center" },
});

export default memo(CustomLoader);
