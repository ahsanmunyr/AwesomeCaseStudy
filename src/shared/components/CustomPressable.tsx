import React, { memo, useCallback } from "react";
import { Pressable, PressableProps, StyleSheet, ViewStyle } from "react-native";
import colors from "../../theme/colors";
import CustomText from "./CustomText";
import { TranslationKey, TranslationParams, useTranslation } from "../i18n";

export type PressableVariant = "primary" | "pill" | "pillActive" | "danger" | "plain";

export interface CustomPressableProps extends Omit<PressableProps, "children" | "accessibilityLabel"> {
  variant?: PressableVariant;
  /** Renders a correctly styled label without callers touching Text. */
  tx?: TranslationKey;
  txParams?: TranslationParams;
  /** Translation key for the accessibility label. */
  accessibilityTx?: TranslationKey;
  accessibilityTxParams?: TranslationParams;
  children?: React.ReactNode;
  style?: ViewStyle;
}

const labelVariant = {
  primary: "buttonPrimary",
  pill: "buttonPill",
  pillActive: "buttonPillActive",
  danger: "buttonDanger",
  plain: "body",
} as const;

const CustomPressable = ({
  variant = "primary",
  tx,
  txParams,
  accessibilityTx,
  accessibilityTxParams,
  children,
  style,
  ...rest
}: CustomPressableProps) => {
  const { t } = useTranslation();

  const buildStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => [variantStyles[variant], pressed && styles.pressed, style],
    [variant, style],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityTx ? t(accessibilityTx, accessibilityTxParams) : undefined}
      style={buildStyle}
      {...rest}>
      {tx ? <CustomText variant={labelVariant[variant]} tx={tx} txParams={txParams} numberOfLines={1} /> : children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
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
