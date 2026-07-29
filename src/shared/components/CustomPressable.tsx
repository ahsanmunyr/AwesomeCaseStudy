import React, { memo, useCallback } from "react";
import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from "react-native";
import colors from "../../theme/colors";
import CustomText from "./CustomText";
import { useIsRTL } from "../i18n";

export type PressableVariant = "primary" | "pill" | "pillActive" | "danger" | "plain";

export interface CustomPressableProps extends Omit<PressableProps, "children" | "style"> {
  variant?: PressableVariant;
  label?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

const textVariantFor = {
  primary: "buttonPrimary",
  pill: "buttonPill",
  pillActive: "buttonPillActive",
  danger: "buttonDanger",
  plain: "body",
} as const;

const CustomPressable = ({ variant = "primary", label, children, style, disabled = false, ...rest }: CustomPressableProps) => {
  const isRTL = useIsRTL();
  const mirrorRow = isRTL && (variant === "pill" || variant === "pillActive");
  const buildStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => [variantStyles[variant], mirrorRow && styles.rowReverse, pressed && styles.pressed, style],
    [variant, mirrorRow, style],
  );

  return (
    <Pressable disabled={disabled} accessibilityRole="button" style={buildStyle} {...rest}>
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
