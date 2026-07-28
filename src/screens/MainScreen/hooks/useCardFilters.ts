import { useCallback, useMemo, useState } from "react";
import { Card } from "../../../../types/heartstone-api/type";
import { ActiveFilters, EMPTY_FILTERS, FilterOptions, countActiveFilters, deriveFilterOptions, filterCards } from "../utils/cardFilters";
import { useDebounce } from "./useDebounce";

export interface UseCardFiltersResult {
  search: string;
  setSearch: (value: string) => void;
  filters: ActiveFilters;
  options: FilterOptions;
  filteredCards: Card[];
  activeFilterCount: number;
  isFiltering: boolean;
  selectType: (slug: string | null) => void;
  selectClass: (slug: string | null) => void;
  selectRarity: (slug: string | null) => void;
  clearFilters: () => void;
}

/**
 * Owns the search/dropdown state and narrows the loaded cards. Everything is
 * memoised so typing or scrolling does not re-run the filter pass needlessly.
 */
export function useCardFilters(cards: Card[]): UseCardFiltersResult {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [cardClass, setCardClass] = useState<string | null>(null);
  const [rarity, setRarity] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search);

  const options = useMemo(() => deriveFilterOptions(cards), [cards]);

  const filters = useMemo<ActiveFilters>(
    () => ({ search: debouncedSearch, type, cardClass, rarity }),
    [debouncedSearch, type, cardClass, rarity],
  );

  const filteredCards = useMemo(() => filterCards(cards, filters), [cards, filters]);

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  const clearFilters = useCallback(() => {
    setSearch(EMPTY_FILTERS.search);
    setType(EMPTY_FILTERS.type);
    setCardClass(EMPTY_FILTERS.cardClass);
    setRarity(EMPTY_FILTERS.rarity);
  }, []);

  return {
    search,
    setSearch,
    filters,
    options,
    filteredCards,
    activeFilterCount,
    isFiltering: activeFilterCount > 0 || debouncedSearch.trim().length > 0,
    selectType: setType,
    selectClass: setCardClass,
    selectRarity: setRarity,
    clearFilters,
  };
}

export default useCardFilters;
