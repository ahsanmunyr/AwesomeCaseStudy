import React, { memo, useCallback, useMemo } from "react";
import { Modal, ScrollView, StyleSheet } from "react-native";
import colors from "../theme/colors";
import { FilterOption } from "../screens/MainScreen/utils/cardFilters";
import { CustomPressable, CustomText } from "../shared/components";
import { TranslationKey, useTranslation } from "../shared/i18n";

interface Props {
  /** Translation key for the filter's own name, e.g. `filters.type`. */
  labelTx: TranslationKey;
  /** Locale namespace holding translations for this filter's API slugs. */
  namespace: string;
  options: FilterOption[];
  value: string | null;
  onChange: (slug: string | null) => void;
  testID?: string;
}

const ALL_SLUG = "__all__";

/** Stops a tap inside the sheet from reaching the closing backdrop. */
const swallowPress = () => {};

const FilterDropdown = ({ labelTx, namespace, options, value, onChange, testID }: Props) => {
  const { t, tApi } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleSelect = useCallback(
    (slug: string) => {
      onChange(slug === ALL_SLUG ? null : slug);
      setIsOpen(false);
    },
    [onChange],
  );

  // API slugs are resolved through the locale files so Arabic shows Arabic
  // card metadata, falling back to the server's English name for new slugs.
  const localised = useMemo(
    () => options.map(option => ({ slug: option.slug, name: tApi(`${namespace}.${option.slug}`, option.name) })),
    [options, namespace, tApi],
  );

  const label = t(labelTx);
  const selected = localised.find(option => option.slug === value);
  const isActive = Boolean(selected);

  return (
    <>
      <CustomPressable
        testID={testID}
        variant={isActive ? "pillActive" : "pill"}
        accessibilityTx="filters.dropdownLabel"
        accessibilityTxParams={{ label, selected: selected?.name ?? t("filters.all") }}
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
          <CustomPressable variant="plain" style={styles.sheet} onPress={swallowPress}>
            <CustomText variant="bodyStrong" tx={labelTx} style={styles.sheetTitle} />
            <ScrollView bounces={false}>
              <Option slug={ALL_SLUG} name={t("filters.allOf", { label })} isSelected={!value} onSelect={handleSelect} />
              {localised.map(option => (
                <Option
                  key={option.slug}
                  slug={option.slug}
                  name={option.name}
                  isSelected={option.slug === value}
                  onSelect={handleSelect}
                />
              ))}
              {options.length === 0 && <CustomText variant="caption" tx="filters.noOptions" style={styles.emptyText} />}
            </ScrollView>
          </CustomPressable>
        </CustomPressable>
      </Modal>
    </>
  );
};

interface OptionProps {
  slug: string;
  name: string;
  isSelected: boolean;
  onSelect: (slug: string) => void;
}

const Option = memo(({ slug, name, isSelected, onSelect }: OptionProps) => {
  const handlePress = useCallback(() => onSelect(slug), [onSelect, slug]);
  return (
    <CustomPressable testID={`option-${slug}`} variant="plain" onPress={handlePress} style={styles.option}>
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
  selected: { fontWeight: "700" },
  emptyText: { paddingVertical: 16 },
});

export default memo(FilterDropdown);
