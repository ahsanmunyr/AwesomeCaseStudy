import { useCallback, useRef } from "react";
import { DEFAULT_PAGE_SIZE } from "../../../services/cards.service";
import { useCards } from "./useCards";
import { useCardFilters } from "./useCardFilters";

/**
 * The single hook MainScreen consumes. Composes pagination (`useCards`) with
 * client-side narrowing (`useCardFilters`) so the component stays presentational.
 */
export function useMainScreen(pageSize: number = DEFAULT_PAGE_SIZE) {
  const { cards, isInitialLoading, isLoadingMore, error, hasMore, loadedCount, totalCount, loadMore, retry } = useCards(pageSize);

  const {
    search,
    setSearch,
    filters,
    options,
    filteredCards,
    activeFilterCount,
    isFiltering,
    selectType,
    selectClass,
    selectRarity,
    clearFilters,
  } = useCardFilters(cards);

  // FlashList fires onEndReached during its first layout, before the user has
  // scrolled, which fetched page 2 immediately on mount. Pagination stays shut
  // until a real scroll gesture has happened.
  const hasScrolled = useRef(false);

  const onScrollBegin = useCallback(() => {
    hasScrolled.current = true;
  }, []);

  // Auto-paging is only safe on the unfiltered list. With a filter active a
  // handful of matches never fills the viewport, so onEndReached re-fires on
  // every append and would walk all 359 pages on its own. While filtering, the
  // next page comes from the explicit footer button instead.
  const handleEndReached = useCallback(() => {
    if (!hasScrolled.current || isFiltering || isLoadingMore || !hasMore) {
      return;
    }
    loadMore();
  }, [isFiltering, isLoadingMore, hasMore, loadMore]);

  return {
    cards: filteredCards,
    search,
    setSearch,
    filters,
    options,
    activeFilterCount,
    isFiltering,
    selectType,
    selectClass,
    selectRarity,
    clearFilters,
    isInitialLoading,
    isLoadingMore,
    error,
    hasMore,
    loadedCount,
    totalCount,
    visibleCount: filteredCards.length,
    onEndReached: handleEndReached,
    onScrollBegin,
    loadMore,
    retry,
  };
}

export default useMainScreen;
