import { useCallback, useEffect, useRef, useState } from "react";
import { getCards, DEFAULT_PAGE_SIZE } from "../../../services/cards.service";
import { ApiErrorInfo, toApiErrorInfo } from "../../../services/apiError";
import { Card } from "../../../../types/heartstone-api/type";
import { cardIdentity } from "../utils/cardIdentity";

export interface UseCardsResult {
  cards: Card[];
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  error: ApiErrorInfo | null;
  hasMore: boolean;
  loadedCount: number;
  totalCount: number;
  loadMore: () => void;
  retry: () => void;
}

/**
 * Appends `incoming`, dropping only cards already present by full identity.
 *
 * Deduping exists to make a retry idempotent, not to collapse reprints - see
 * `cardIdentity` for why `slug` alone is the wrong key.
 */
export function mergeUniqueCards(existing: Card[], incoming: Card[]): Card[] {
  const seen = new Set(existing.map(cardIdentity));
  const additions = incoming.filter(card => {
    const identity = cardIdentity(card);
    if (seen.has(identity)) {
      return false;
    }
    seen.add(identity);
    return true;
  });
  return additions.length ? [...existing, ...additions] : existing;
}

/**
 * Loads the All Cards service one page at a time and accumulates the results.
 *
 * The API ignores filter params, so this hook owns pagination only;
 * `useCardFilters` narrows what it returns.
 */
export function useCards(pageSize: number = DEFAULT_PAGE_SIZE): UseCardsResult {
  const [cards, setCards] = useState<Card[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Bumped by `retry` so the effect re-runs for the page that just failed.
  const [reloadToken, setReloadToken] = useState(0);

  const isMounted = useRef(true);
  // Latest values for callbacks that must stay referentially stable.
  const statusRef = useRef({ isLoading, pageCount, page });
  statusRef.current = { isLoading, pageCount, page };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    getCards({ page, pageSize, signal: controller.signal })
      .then(response => {
        if (!isMounted.current || controller.signal.aborted) {
          return;
        }
        setCards(previous => mergeUniqueCards(previous, response.cards ?? []));
        setPageCount(response.pageCount);
        setTotalCount(response.cardCount);
      })
      .catch((requestError: unknown) => {
        if (!isMounted.current || controller.signal.aborted) {
          return;
        }
        setError(toApiErrorInfo(requestError));
      })
      .finally(() => {
        if (isMounted.current && !controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [page, pageSize, reloadToken]);

  const hasMore = pageCount !== null && page < pageCount;

  const loadMore = useCallback(() => {
    const status = statusRef.current;
    if (status.isLoading || status.pageCount === null) {
      return;
    }
    if (status.page >= status.pageCount) {
      return;
    }
    setPage(current => current + 1);
  }, []);

  const retry = useCallback(() => {
    if (statusRef.current.isLoading) {
      return;
    }
    setReloadToken(token => token + 1);
  }, []);

  return {
    cards,
    isInitialLoading: isLoading && cards.length === 0,
    isLoadingMore: isLoading && cards.length > 0,
    error,
    hasMore,
    loadedCount: cards.length,
    totalCount,
    loadMore,
    retry,
  };
}

export default useCards;
