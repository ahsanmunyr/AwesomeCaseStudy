import React, { memo, useCallback } from "react";
import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from "react-native";
import colors from "../../theme/colors";
import CustomText from "./CustomText";
import { useIsRTL } from "../i18n";

export type PressableVariant = "primary" | "pill" | "pillActive" | "danger" | "plain";

export interface CustomPressableProps extends Omit<PressableProps, "children" | "style"> {
  variant?: PressableVariant;
  /** Button text. Already translated by the caller. */
  label?: string;
  /** Use instead of label when the button needs custom content. */
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Which text style goes with which button style. */
const textVariantFor = {
  primary: "buttonPrimary",
  pill: "buttonPill",
  pillActive: "buttonPillActive",
  danger: "buttonDanger",
  plain: "body",
} as const;

/**
 * The only button of the app. Pass `label` for a normal text button, or
 * `children` when the button holds something else (an icon, a row of text).
 */
const CustomPressable = ({ variant = "primary", label, children, style, ...rest }: CustomPressableProps) => {
  // Only the pill variants lay their children out in a row, so only they need
  // mirroring. The "plain" variant is also used as a full-screen backdrop and
  // as a column, and reversing those would break the layout.
  const isRTL = useIsRTL();
  const mirrorRow = isRTL && (variant === "pill" || variant === "pillActive");

  // Pressable wants a function so it can restyle while the finger is down.
  // useCallback keeps that function stable between renders.
  const buildStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => [variantStyles[variant], mirrorRow && styles.rowReverse, pressed && styles.pressed, style],
    [variant, mirrorRow, style],
  );

  return (
    <Pressable accessibilityRole="button" style={buildStyle} {...rest}>
      {label !== undefined ? (
        <CustomText variant={textVariantFor[variant]} numberOfLines={1}>
          {label}
        </CustomText>
      ) : (
        children
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
  // Puts the dropdown caret on the left of its label in Arabic.
  rowReverse: { flexDirection: "row-reverse" },
});

const variantStyles = StyleSheet.create({
  primary: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.accent,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  pillActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  danger: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  plain: {},
});

export default memo(CustomPressable);
