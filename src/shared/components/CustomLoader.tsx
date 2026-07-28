import React, { memo } from "react";
import { ActivityIndicator, ActivityIndicatorProps, StyleSheet } from "react-native";
import colors from "../../theme/colors";
import CustomText from "./CustomText";
import CustomView from "./CustomView";

export interface CustomLoaderProps extends Omit<ActivityIndicatorProps, "color"> {
  /** Optional text shown under the spinner. Already translated by the caller. */
  caption?: string;
  color?: string;
  /** Fills the whole space and centres itself. Used for the first load. */
  fullscreen?: boolean;
}

const CustomLoader = ({ caption, size = "small", color = colors.accent, fullscreen, testID, ...rest }: CustomLoaderProps) => (
  <CustomView testID={testID} center flex={fullscreen} style={styles.container}>
    <ActivityIndicator size={size} color={color} {...rest} />
    {caption ? (
      <CustomText variant="subtitle" style={styles.caption}>
        {caption}
      </CustomText>
    ) : null}
  </CustomView>
);

const styles = StyleSheet.create({
  container: { paddingVertical: 20, gap: 12 },
  caption: { textAlign: "center" },
});

export default memo(CustomLoader);
