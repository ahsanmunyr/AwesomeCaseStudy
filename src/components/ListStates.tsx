import React, { memo } from "react";
import { StyleSheet } from "react-native";
import { ApiErrorInfo } from "../services/apiError";
import { CustomLoader, CustomPressable, CustomText, CustomView } from "../shared/components";
import { useTranslation } from "../shared/i18n";

export const LoadingState = memo(() => {
  const { t } = useTranslation();
  return <CustomLoader testID="loading-state" fullscreen size="large" caption={t("list.loading")} />;
});

interface ErrorProps {
  error: ApiErrorInfo;
  onRetry: () => void;
}

export const ErrorState = memo(({ error, onRetry }: ErrorProps) => {
  const { t } = useTranslation();

  return (
    <CustomView testID="error-state" center style={styles.centered}>
      <CustomText variant="error">{t(error.key, error.params)}</CustomText>
      <CustomPressable testID="retry-button" variant="primary" label={t("list.retry")} onPress={onRetry} />
    </CustomView>
  );
});

interface EmptyProps {
  hasMore: boolean;
  onLoadMore: () => void;
  loadedCount: number;
  totalCount: number;
}

export const EmptyState = memo(({ hasMore, onLoadMore, loadedCount, totalCount }: EmptyProps) => {
  const { t } = useTranslation();

  return (
    <CustomView testID="empty-state" center style={styles.centered}>
      <CustomText variant="subtitle" style={styles.centeredText}>
        {t("list.empty")}
      </CustomText>

      {hasMore && (
        <>
          <CustomText variant="caption" style={styles.centeredText}>
            {t("list.emptyHint")}
          </CustomText>
          <CustomPressable testID="empty-load-more" variant="primary" label={t("list.loadMoreCards")} onPress={onLoadMore} />
          <CustomText variant="caption" style={styles.centeredText}>
            {t("list.progress", { loaded: loadedCount, total: totalCount })}
          </CustomText>
        </>
      )}
    </CustomView>
  );
});

interface FooterProps {
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  loadedCount: number;
  totalCount: number;
  isFiltering: boolean;
}

export const ListFooter = memo(({ isLoadingMore, hasMore, onLoadMore, loadedCount, totalCount, isFiltering }: FooterProps) => {
  const { t } = useTranslation();

  if (isLoadingMore) {
    return <CustomLoader testID="footer-loading" />;
  }

  if (!hasMore) {
    return (
      <CustomView center style={styles.footer}>
        <CustomText variant="subtitle" style={styles.centeredText}>
          {t("list.allLoaded", { total: totalCount })}
        </CustomText>
      </CustomView>
    );
  }

  return (
    <CustomView center style={styles.footer}>
      <CustomPressable testID="load-more" variant="primary" label={t("list.loadMore")} onPress={onLoadMore} />
      <CustomText variant="caption" style={styles.centeredText}>
        {isFiltering
          ? t("list.progressFiltered", { loaded: loadedCount, total: totalCount })
          : t("list.progress", { loaded: loadedCount, total: totalCount })}
      </CustomText>
    </CustomView>
  );
});

const styles = StyleSheet.create({
  centered: { paddingVertical: 48, paddingHorizontal: 32, gap: 12 },
  footer: { paddingVertical: 20, gap: 8 },
  centeredText: { textAlign: "center" },
});
