import React, { memo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import colors from "../theme/colors";
import SearchBar from "./SearchBar";
import FilterDropdown from "./FilterDropdown";
import { FilterOptions } from "../screens/MainScreen/utils/cardFilters";
import { CustomPressable, CustomView } from "../shared/components";
import { useIsRTL, useTranslation } from "../shared/i18n";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  options: FilterOptions;
  selectedType: string | null;
  selectedClass: string | null;
  selectedRarity: string | null;
  onSelectType: (slug: string | null) => void;
  onSelectClass: (slug: string | null) => void;
  onSelectRarity: (slug: string | null) => void;
  onClear: () => void;
  activeFilterCount: number;
}

/** The search box plus the three dropdowns, in a row that scrolls sideways. */
const FilterBar = ({
  search,
  onSearchChange,
  options,
  selectedType,
  selectedClass,
  selectedRarity,
  onSelectType,
  onSelectClass,
  onSelectRarity,
  onClear,
  activeFilterCount,
}: Props) => {
  const { t } = useTranslation();
  const isRTL = useIsRTL();

  return (
    <CustomView style={styles.container}>
      <SearchBar value={search} onChange={onSearchChange} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, isRTL && styles.rowRTL]}
        keyboardShouldPersistTaps="handled">
        <FilterDropdown
          testID="filter-type"
          label={t("filters.type")}
          namespace="cardTypes"
          options={options.types}
          value={selectedType}
          onChange={onSelectType}
        />
        <FilterDropdown
          testID="filter-class"
          label={t("filters.class")}
          namespace="cardClasses"
          options={options.classes}
          value={selectedClass}
          onChange={onSelectClass}
        />
        <FilterDropdown
          testID="filter-rarity"
          label={t("filters.rarity")}
          namespace="cardRarities"
          options={options.rarities}
          value={selectedRarity}
          onChange={onSelectRarity}
        />

        {activeFilterCount > 0 && (
          <CustomPressable
            testID="clear-filters"
            variant="danger"
            label={t("filters.clear", { filterCount: activeFilterCount })}
            accessibilityLabel={t("filters.clearLabel")}
            onPress={onClear}
          />
        )}
      </ScrollView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  // Explicit left/right rather than start/end: those two are resolved from
  // I18nManager, which only updates after an app restart.
  row: { flexDirection: "row", gap: 8, alignItems: "center", flexGrow: 1, paddingRight: 16 },
  rowRTL: { flexDirection: "row-reverse", paddingRight: 0, paddingLeft: 16 },
});

export default memo(FilterBar);
