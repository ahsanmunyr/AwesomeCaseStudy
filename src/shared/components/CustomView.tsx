import React, { memo } from "react";
import { StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import colors from "../../theme/colors";

export type ViewVariant = "transparent" | "screen" | "surface" | "card";

export interface CustomViewProps extends ViewProps {
  variant?: ViewVariant;
  /** Lays children out horizontally, mirrored automatically in RTL. */
  row?: boolean;
  center?: boolean;
  flex?: boolean;
}

const CustomView = ({ variant = "transparent", row, center, flex, style, children, ...rest }: CustomViewProps) => (
  <View style={[variantStyles[variant], row && styles.row, center && styles.center, flex && styles.flex, style as ViewStyle]} {...rest}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  // `row` mirrors to row-reverse automatically once the app is in RTL mode.
  row: { flexDirection: "row", alignItems: "center" },
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
