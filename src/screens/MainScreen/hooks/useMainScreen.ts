import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_PAGE_SIZE, getCards } from "../../../services/cards.service";
import { ApiErrorInfo, toApiErrorInfo } from "../../../services/apiError";
import { CardWithId } from "../../../../types/heartstone-api/type";
import { ActiveFilters, EMPTY_FILTERS, FilterOptions, countActiveFilters, deriveFilterOptions, filterCards } from "../utils/cardFilters";
import { useDebounce } from "../../../hooks/useDebounce";

interface MainScreenReturnTypes {
  cards: CardWithId[];
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  error: ApiErrorInfo | null;
  search: string;
  setSearch: (value: string) => void;
  filters: ActiveFilters;
  options: FilterOptions;
  activeFilterCount: number;
  isFiltering: boolean;
  selectType: (slug: string | null) => void;
  selectClass: (slug: string | null) => void;
  selectRarity: (slug: string | null) => void;
  clearFilters: () => void;
  hasMore: boolean;
  loadedCount: number;
  visibleCount: number;
  totalCount: number;
  onEndReached: () => void;
  onScrollBegin: () => void;
  loadMore: () => void;
  retry: () => void;
}

export const useMainScreen = (pageSize: number = DEFAULT_PAGE_SIZE): MainScreenReturnTypes => {
  const [cards, setCards] = useState<CardWithId[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [cardClass, setCardClass] = useState<string | null>(null);
  const [rarity, setRarity] = useState<string | null>(null);

  const hasScrolled = useRef(false);

  useEffect(() => {
    let isActive = true;

    async function loadPage() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getCards(page, pageSize);
        if (!isActive) {
          return;
        }

        setCards(current => [...current, ...response.cards]);
        setTotalPages(response.pageCount);
        setTotalCount(response.cardCount);
      } catch (requestError) {
        if (isActive) {
          setError(toApiErrorInfo(requestError));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      isActive = false;
    };
  }, [page, pageSize, retryCount]);

  const debouncedSearch = useDebounce(search);
  const options = useMemo(() => deriveFilterOptions(cards), [cards]);
  const filters = useMemo<ActiveFilters>(
    () => ({ search: debouncedSearch, type, cardClass, rarity }),
    [debouncedSearch, type, cardClass, rarity],
  );

  const filteredCards = useMemo(() => filterCards(cards, filters), [cards, filters]);
  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);
  const isFiltering = activeFilterCount > 0 || debouncedSearch.trim().length > 0;
  const isLoadingMore = isLoading && cards.length > 0;
  const hasMore = page < totalPages;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) {
      return;
    }
    setPage(current => current + 1);
  }, [isLoading, hasMore]);

  const retry = useCallback(() => {
    if (isLoading) {
      return;
    }
    setRetryCount(current => current + 1);
  }, [isLoading]);

  const clearFilters = useCallback(() => {
    setSearch(EMPTY_FILTERS.search);
    setType(EMPTY_FILTERS.type);
    setCardClass(EMPTY_FILTERS.cardClass);
    setRarity(EMPTY_FILTERS.rarity);
  }, []);

  const onScrollBegin = useCallback(() => {
    hasScrolled.current = true;
  }, []);

  const onEndReached = useCallback(() => {
    if (!hasScrolled.current || isFiltering || isLoadingMore || !hasMore) {
      return;
    }
    loadMore();
  }, [isFiltering, isLoadingMore, hasMore, loadMore]);

  return {
    cards: filteredCards,
    isInitialLoading: isLoading && cards.length === 0,
    isLoadingMore,
    error,
    search,
    setSearch,
    filters,
    options,
    activeFilterCount,
    isFiltering,
    selectType: setType,
    selectClass: setCardClass,
    selectRarity: setRarity,
    clearFilters,
    hasMore,
    loadedCount: cards.length,
    visibleCount: filteredCards.length,
    totalCount,
    onEndReached,
    onScrollBegin,
    loadMore,
    retry,
  };
};
