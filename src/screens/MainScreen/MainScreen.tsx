import React, { useCallback, useMemo } from "react";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import createStyles from "./MainScreen.style";
import { useMainScreen } from "./hooks/useMainScreen";
import CardItem from "../../components/CardItem";
import FilterBar from "../../components/FilterBar";
import { EmptyState, ErrorState, ListFooter, LoadingState } from "../../components/ListStates";
import { CardWithId } from "../../../types/heartstone-api/type";
import { CustomPressable, CustomText, CustomView } from "../../shared/components";
import { useTranslation } from "../../shared/i18n";

const MainScreen = () => {
  const styles = useMemo(() => createStyles(), []);
  const { t, i18n } = useTranslation();
  const toggleLanguage = useCallback(() => {
    i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");
  }, [i18n]);

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

  const renderItem = useCallback(({ item }: { item: CardWithId }) => <CardItem card={item} />, []);

  const keyExtractor = useCallback((item: CardWithId) => item.id, []);

  const listFooter = useMemo(() => {
    if (error) {
      return <ErrorState error={error} onRetry={retry} />;
    }

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

  function renderBody() {
    if (isInitialLoading) {
      return <LoadingState />;
    }
    if (error && loadedCount === 0) {
      return <ErrorState error={error} onRetry={retry} />;
    }

    console.log(cards, "cards---------->");
    return (
      <FlashList
        testID="cards-list"
        data={cards}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        onScrollBeginDrag={onScrollBegin}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        keyboardShouldPersistTaps="handled"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <CustomView row style={styles.header}>
        <CustomView style={styles.headerTexts}>
          <CustomText variant="title">{t("app.title")}</CustomText>
          <CustomText variant="subtitle">
            {isFiltering
              ? t("app.subtitleFiltered", { visible: visibleCount, loaded: loadedCount })
              : t("app.subtitleLoaded", { loaded: loadedCount, total: totalCount })}
          </CustomText>
        </CustomView>

        <CustomPressable
          testID="language-toggle"
          variant="pill"
          label={t("app.otherLanguage")}
          accessibilityLabel={t("app.changeLanguage")}
          onPress={toggleLanguage}
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

      {renderBody()}
    </SafeAreaView>
  );
};

export default MainScreen;
