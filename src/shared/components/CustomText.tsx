import React, { memo } from "react";
import { StyleSheet, Text, TextProps, TextStyle } from "react-native";
import colors from "../../theme/colors";
import { useIsRTL } from "../i18n";

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
  /** Picks the ready-made style below, so screens never invent font sizes. */
  variant?: TextVariant;
  /** Overrides only the colour, e.g. the rarity colour on a card. */
  color?: string;
}

/**
 * The only Text component used in the app. It applies one of the styles below
 * and sets the writing direction for Arabic.
 *
 * Pass the text as children: <CustomText>{t("app.title")}</CustomText>
 */
const CustomText = ({ variant = "body", color, style, children, ...rest }: CustomTextProps) => {
  const isRTL = useIsRTL();

  // The direction goes first so a variant that sets its own alignment (the
  // centred "error" text) still wins, and the caller's `style` wins over both.
  return (
    <Text style={[isRTL ? styles.rtl : styles.ltr, variantStyles[variant], color ? { color } : undefined, style as TextStyle]} {...rest}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  // textAlign matters as much as writingDirection: without it, Arabic text
  // renders correctly but still sits against the left edge.
  ltr: { writingDirection: "ltr", textAlign: "left" },
  rtl: { writingDirection: "rtl", textAlign: "right" },
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

// memo stops a card row from re-rendering when its props did not change.
export default memo(CustomText);
