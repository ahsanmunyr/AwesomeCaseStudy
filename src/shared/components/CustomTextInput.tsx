import React, { memo } from "react";
import { StyleSheet, TextInput, TextInputProps, TextStyle } from "react-native";
import colors from "../../theme/colors";
import { useTranslation } from "../i18n";

export type CustomTextInputProps = TextInputProps;

const CustomTextInput = ({ style, ...rest }: CustomTextInputProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  return (
    <TextInput
      style={[styles.input, isRTL ? styles.rtl : styles.ltr, style as TextStyle]}
      placeholderTextColor={colors.textMuted}
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
