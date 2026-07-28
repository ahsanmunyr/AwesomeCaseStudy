import React, { memo } from "react";
import { StyleSheet } from "react-native";
import { ApiErrorInfo } from "../services/apiError";
import { CustomLoader, CustomPressable, CustomText, CustomView } from "../shared/components";
import { useTranslation } from "../shared/i18n";

export const LoadingState = memo(() => <CustomLoader testID="loading-state" fullscreen size="large" tx="list.loading" />);

interface ErrorProps {
  error: ApiErrorInfo;
  onRetry: () => void;
}

export const ErrorState = memo(({ error, onRetry }: ErrorProps) => {
  const { t } = useTranslation();
  return (
    <CustomView testID="error-state" center style={styles.centered}>
      <CustomText variant="error">{t(error.key, error.params)}</CustomText>
      <CustomPressable testID="retry-button" variant="primary" tx="list.retry" onPress={onRetry} />
    </CustomView>
  );
});

interface EmptyProps {
  hasMore: boolean;
  onLoadMore: () => void;
  loadedCount: number;
  totalCount: number;
}

export const EmptyState = memo(({ hasMore, onLoadMore, loadedCount, totalCount }: EmptyProps) => (
  <CustomView testID="empty-state" center style={styles.centered}>
    <CustomText variant="subtitle" tx="list.empty" style={styles.centeredText} />
    {hasMore && (
      <>
        <CustomText variant="caption" tx="list.emptyHint" style={styles.centeredText} />
        <CustomPressable testID="empty-load-more" variant="primary" tx="list.loadMoreCards" onPress={onLoadMore} />
        <CustomText
          variant="caption"
          tx="list.progress"
          txParams={{ loaded: loadedCount, total: totalCount }}
          style={styles.centeredText}
        />
      </>
    )}
  </CustomView>
));

interface FooterProps {
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  loadedCount: number;
  totalCount: number;
  isFiltering: boolean;
}

export const ListFooter = memo(({ isLoadingMore, hasMore, onLoadMore, loadedCount, totalCount, isFiltering }: FooterProps) => {
  if (isLoadingMore) {
    return <CustomLoader testID="footer-loading" />;
  }

  if (!hasMore) {
    return (
      <CustomView center style={styles.footer}>
        <CustomText variant="subtitle" tx="list.allLoaded" txParams={{ total: totalCount }} style={styles.centeredText} />
      </CustomView>
    );
  }

  return (
    <CustomView center style={styles.footer}>
      <CustomPressable testID="load-more" variant="primary" tx="list.loadMore" onPress={onLoadMore} />
      <CustomText
        variant="caption"
        tx={isFiltering ? "list.progressFiltered" : "list.progress"}
        txParams={{ loaded: loadedCount, total: totalCount }}
        style={styles.centeredText}
      />
    </CustomView>
  );
});

const styles = StyleSheet.create({
  centered: { paddingVertical: 48, paddingHorizontal: 32, gap: 12 },
  footer: { paddingVertical: 20, gap: 8 },
  centeredText: { textAlign: "center" },
});
