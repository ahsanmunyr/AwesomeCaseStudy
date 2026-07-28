import React, { memo, useCallback } from "react";
import { StyleSheet } from "react-native";
import colors from "../theme/colors";
import { CustomPressable, CustomText, CustomTextInput, CustomView } from "../shared/components";
import { useTranslation } from "../shared/i18n";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

/** Search box with a small ✕ button that appears once something is typed. */
const SearchBar = ({ value, onChange }: Props) => {
  const { t } = useTranslation();

  const handleClear = useCallback(() => onChange(""), [onChange]);

  return (
    <CustomView row style={styles.container}>
      <CustomTextInput
        testID="search-input"
        accessibilityLabel={t("search.label")}
        placeholder={t("search.placeholder")}
        style={styles.input}
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
      />

      {value.length > 0 && (
        <CustomPressable
          testID="search-clear"
          variant="plain"
          accessibilityLabel={t("search.clear")}
          hitSlop={8}
          onPress={handleClear}
          style={styles.clear}>
          <CustomText variant="label">✕</CustomText>
        </CustomPressable>
      )}
    </CustomView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: { flex: 1 },
  // No side-specific padding here: the row itself flips in Arabic, so a gap on
  // the container keeps the spacing right in both directions.
  clear: {},
});

export default memo(SearchBar);
