import React, { memo } from "react";
import { StyleSheet, TextInput, TextInputProps, TextStyle } from "react-native";
import colors from "../../theme/colors";
import { TranslationKey, useTranslation } from "../i18n";

export interface CustomTextInputProps extends Omit<TextInputProps, "placeholder" | "accessibilityLabel"> {
  /** Translation key for the placeholder. */
  placeholderTx?: TranslationKey;
  /** Translation key for the accessibility label. */
  accessibilityTx?: TranslationKey;
}

const CustomTextInput = ({ placeholderTx, accessibilityTx, style, ...rest }: CustomTextInputProps) => {
  const { t, isRTL } = useTranslation();

  return (
    <TextInput
      style={[styles.input, isRTL ? styles.rtl : styles.ltr, style as TextStyle]}
      placeholder={placeholderTx ? t(placeholderTx) : undefined}
      placeholderTextColor={colors.textMuted}
      accessibilityLabel={accessibilityTx ? t(accessibilityTx) : undefined}
      autoCorrect={false}
      autoCapitalize="none"
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  input: { color: colors.text, fontSize: 15, paddingVertical: 10 },
  ltr: { textAlign: "left", writingDirection: "ltr" },
  rtl: { textAlign: "right", writingDirection: "rtl" },
});

export default memo(CustomTextInput);
