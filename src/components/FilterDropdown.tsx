import React, { memo, useCallback, useMemo, useState } from "react";
import { Modal, ScrollView, StyleSheet } from "react-native";
import colors from "../theme/colors";
import { FilterOption } from "../screens/MainScreen/utils/cardFilters";
import { CustomPressable, CustomText } from "../shared/components";
import { TranslationKey, useIsRTL, useTranslation } from "../shared/i18n";

interface Props {
  label: string;
  namespace: string;
  options: FilterOption[];
  value: string | null;
  onChange: (slug: string | null) => void;
  testID?: string;
}

const ALL_SLUG = "__all__";
const FilterDropdown = ({ label, namespace, options, value, onChange, testID }: Props) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleSelect = useCallback(
    (slug: string) => {
      onChange(slug === ALL_SLUG ? null : slug);
      setIsOpen(false);
    },
    [onChange],
  );

  const translatedOptions = useMemo(
    () =>
      options.map(option => ({
        slug: option.slug,
        name: t(`${namespace}.${option.slug}` as TranslationKey, { defaultValue: option.name }),
      })),
    [options, namespace, t],
  );

  const selected = translatedOptions.find(option => option.slug === value);
  const isActive = Boolean(selected);

  return (
    <>
      <CustomPressable
        testID={testID}
        variant={isActive ? "pillActive" : "pill"}
        accessibilityLabel={t("filters.dropdownLabel", { label, selected: selected?.name ?? t("filters.all") })}
        onPress={open}>
        <CustomText variant={isActive ? "buttonPillActive" : "buttonPill"} numberOfLines={1}>
          {selected ? selected.name : label}
        </CustomText>
        <CustomText variant={isActive ? "buttonPillActive" : "buttonPill"} style={styles.caret}>
          ▾
        </CustomText>
      </CustomPressable>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={close}>
        <CustomPressable variant="plain" style={styles.backdrop} onPress={close}>
          <CustomPressable variant="plain" style={styles.sheet} onPress={doNothing}>
            <CustomText variant="bodyStrong" style={styles.sheetTitle}>
              {label}
            </CustomText>

            <ScrollView bounces={false}>
              <Option slug={ALL_SLUG} name={t("filters.allOf", { label })} isSelected={!value} onSelect={handleSelect} />

              {translatedOptions.map(option => (
                <Option
                  key={option.slug}
                  slug={option.slug}
                  name={option.name}
                  isSelected={option.slug === value}
                  onSelect={handleSelect}
                />
              ))}

              {options.length === 0 && (
                <CustomText variant="caption" style={styles.emptyText}>
                  {t("filters.noOptions")}
                </CustomText>
              )}
            </ScrollView>
          </CustomPressable>
        </CustomPressable>
      </Modal>
    </>
  );
};

function doNothing() {}

interface OptionProps {
  slug: string;
  name: string;
  isSelected: boolean;
  onSelect: (slug: string) => void;
}

const Option = memo(({ slug, name, isSelected, onSelect }: OptionProps) => {
  const isRTL = useIsRTL();
  const handlePress = useCallback(() => onSelect(slug), [onSelect, slug]);

  return (
    <CustomPressable testID={`option-${slug}`} variant="plain" onPress={handlePress} style={[styles.option, isRTL && styles.optionRTL]}>
      <CustomText variant="body" color={isSelected ? colors.accent : undefined} style={isSelected ? styles.selected : undefined}>
        {name}
      </CustomText>
      {isSelected && (
        <CustomText variant="body" color={colors.accent}>
          ✓
        </CustomText>
      )}
    </CustomPressable>
  );
});

const styles = StyleSheet.create({
  caret: { fontSize: 11 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: "60%",
  },
  sheetTitle: { fontSize: 16, marginBottom: 8 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionRTL: { flexDirection: "row-reverse" },
  selected: { fontWeight: "700" },
  emptyText: { paddingVertical: 16 },
});

export default memo(FilterDropdown);
