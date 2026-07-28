import React, { memo } from "react";
import { StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import colors from "../../theme/colors";
import { useIsRTL } from "../i18n";

export type ViewVariant = "transparent" | "screen" | "surface" | "card";

export interface CustomViewProps extends ViewProps {
  variant?: ViewVariant;
  /** Lays children out horizontally, right to left when the language is Arabic. */
  row?: boolean;
  center?: boolean;
  flex?: boolean;
}

const CustomView = ({ variant = "transparent", row, center, flex, style, children, ...rest }: CustomViewProps) => {
  const isRTL = useIsRTL();

  // "row-reverse" is what mirrors the layout the moment the language changes.
  // Plain "row" would only mirror after an app restart, because React Native
  // reads I18nManager.isRTL, and that flag is only applied on the next launch.
  const rowStyle = isRTL ? styles.rowReverse : styles.row;

  return (
    <View style={[variantStyles[variant], row && rowStyle, center && styles.center, flex && styles.flex, style as ViewStyle]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  rowReverse: { flexDirection: "row-reverse", alignItems: "center" },
  center: { alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
});

const variantStyles = StyleSheet.create({
  transparent: {},
  screen: { flex: 1, backgroundColor: colors.background },
  surface: { backgroundColor: colors.surface },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 12 },
});

export default memo(CustomView);
