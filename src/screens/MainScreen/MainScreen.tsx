import React, { useCallback, useMemo } from "react";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import createStyles from "./MainScreen.style";
import { useMainScreen } from "./hooks/useMainScreen";
import CardItem from "../../components/CardItem";
import FilterBar from "../../components/FilterBar";
import { EmptyState, ErrorState, ListFooter, LoadingState } from "../../components/ListStates";
import { Card } from "../../../types/heartstone-api/type";
import { CustomText, CustomView } from "../../shared/components";
import { cardIdentity } from "./utils/cardIdentity";

const MainScreen = () => {
  const styles = useMemo(() => createStyles(), []);
  const {
    cards,
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
    visibleCount,
    onEndReached,
    onScrollBegin,
    loadMore,
    retry,
  } = useMainScreen();

  const renderItem = useCallback(({ item }: { item: Card }) => <CardItem card={item} />, []);

  // slug repeats across reprints, so it would produce duplicate React keys.
  const keyExtractor = useCallback((item: Card) => cardIdentity(item), []);

  // A failure part-way through paging must stay visible without wiping the
  // cards already on screen.
  const listFooter = useMemo(() => {
    if (error) {
      return <ErrorState error={error} onRetry={retry} />;
    }
    // FlashList renders the empty component and the footer together, and
    // EmptyState already offers "Load more cards" - a footer button here would
    // be a second, identical control.
    if (cards.length === 0) {
      return null;
    }
    return (
      <ListFooter
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        loadedCount={loadedCount}
        totalCount={totalCount}
        isFiltering={isFiltering}
      />
    );
  }, [error, retry, cards.length, isLoadingMore, hasMore, loadMore, loadedCount, totalCount, isFiltering]);

  const listEmpty = useMemo(
    () => <EmptyState hasMore={hasMore} onLoadMore={loadMore} loadedCount={loadedCount} totalCount={totalCount} />,
    [hasMore, loadMore, loadedCount, totalCount],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <CustomView style={styles.header}>
        <CustomText variant="title" tx="app.title" />
        <CustomText
          variant="subtitle"
          tx={isFiltering ? "app.subtitleFiltered" : "app.subtitleLoaded"}
          txParams={{ visible: visibleCount, loaded: loadedCount, total: totalCount }}
        />
      </CustomView>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        options={options}
        selectedType={filters.type}
        selectedClass={filters.cardClass}
        selectedRarity={filters.rarity}
        onSelectType={selectType}
        onSelectClass={selectClass}
        onSelectRarity={selectRarity}
        onClear={clearFilters}
        activeFilterCount={activeFilterCount}
      />

      {isInitialLoading ? (
        <LoadingState />
      ) : error && loadedCount === 0 ? (
        <ErrorState error={error} onRetry={retry} />
      ) : (
        <FlashList
          testID="cards-list"
          data={cards}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          onMomentumScrollBegin={onScrollBegin}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={listFooter}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
};

export default MainScreen;
