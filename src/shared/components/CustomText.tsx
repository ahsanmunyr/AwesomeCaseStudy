import React, { memo } from "react";
import { StyleSheet, Text, TextProps, TextStyle } from "react-native";
import colors from "../../theme/colors";
import { TranslationKey, TranslationParams, useTranslation } from "../i18n";

export type TextVariant =
  | "title"
  | "subtitle"
  | "body"
  | "bodyStrong"
  | "label"
  | "caption"
  | "error"
  | "accent"
  | "buttonPrimary"
  | "buttonPill"
  | "buttonPillActive"
  | "buttonDanger";

export interface CustomTextProps extends TextProps {
  variant?: TextVariant;
  /** Translation key. Preferred over children so no literal ships in a screen. */
  tx?: TranslationKey;
  txParams?: TranslationParams;
  color?: string;
}

/**
 * The only Text in the app. Pass `tx` for translated copy; `children` is
 * reserved for values that come from the API (card names, artist names).
 */
const CustomText = ({ variant = "body", tx, txParams, color, style, children, ...rest }: CustomTextProps) => {
  const { t, isRTL } = useTranslation();
  const content = tx ? t(tx, txParams) : children;

  return (
    <Text style={[variantStyles[variant], isRTL ? styles.rtl : styles.ltr, color ? { color } : undefined, style as TextStyle]} {...rest}>
      {content}
    </Text>
  );
};

const styles = StyleSheet.create({
  ltr: { writingDirection: "ltr" },
  rtl: { writingDirection: "rtl" },
});

const variantStyles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted },
  body: { fontSize: 14, color: colors.text },
  bodyStrong: { fontSize: 15, fontWeight: "700", color: colors.text },
  label: { fontSize: 13, color: colors.textMuted },
  caption: { fontSize: 12, color: colors.textMuted },
  error: { fontSize: 14, color: colors.danger, textAlign: "center" },
  accent: { fontSize: 12, fontWeight: "600", color: colors.accent },
  buttonPrimary: { fontSize: 14, fontWeight: "700", color: colors.accentText },
  buttonPill: { fontSize: 13, color: colors.textMuted, maxWidth: 110 },
  buttonPillActive: { fontSize: 13, fontWeight: "600", color: colors.accentText, maxWidth: 110 },
  buttonDanger: { fontSize: 13, fontWeight: "600", color: colors.danger },
});

export default memo(CustomText);
