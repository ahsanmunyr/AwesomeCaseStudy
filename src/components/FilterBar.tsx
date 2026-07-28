import React, { memo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import colors from "../theme/colors";
import SearchBar from "./SearchBar";
import FilterDropdown from "./FilterDropdown";
import { FilterOptions } from "../screens/MainScreen/utils/cardFilters";
import { CustomPressable, CustomView } from "../shared/components";

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
}: Props) => (
  <CustomView style={styles.container}>
    <SearchBar value={search} onChange={onSearchChange} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} keyboardShouldPersistTaps="handled">
      <FilterDropdown
        testID="filter-type"
        labelTx="filters.type"
        namespace="cardTypes"
        options={options.types}
        value={selectedType}
        onChange={onSelectType}
      />
      <FilterDropdown
        testID="filter-class"
        labelTx="filters.class"
        namespace="cardClasses"
        options={options.classes}
        value={selectedClass}
        onChange={onSelectClass}
      />
      <FilterDropdown
        testID="filter-rarity"
        labelTx="filters.rarity"
        namespace="cardRarities"
        options={options.rarities}
        value={selectedRarity}
        onChange={onSelectRarity}
      />
      {activeFilterCount > 0 && (
        <CustomPressable
          testID="clear-filters"
          variant="danger"
          tx="filters.clear"
          txParams={{ count: activeFilterCount }}
          accessibilityTx="filters.clearLabel"
          onPress={onClear}
        />
      )}
    </ScrollView>
  </CustomView>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  row: { flexDirection: "row", gap: 8, alignItems: "center", paddingEnd: 16 },
});

export default memo(FilterBar);
