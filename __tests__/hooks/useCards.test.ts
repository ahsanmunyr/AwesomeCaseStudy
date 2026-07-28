import { act, renderHook, waitFor } from "@testing-library/react-native";

jest.mock("../../src/services/cards.service", () => ({
  __esModule: true,
  DEFAULT_PAGE_SIZE: 12,
  getCards: jest.fn(),
}));

import { getCards } from "../../src/services/cards.service";
import { mergeUniqueCards, useCards } from "../../src/screens/MainScreen/hooks/useCards";
import { MINION, MINION_REPRINT, SPELL, WEAPON, makeResponse } from "../fixtures/cards";
import { ApiError } from "../../src/services/apiError";

const mockedGetCards = getCards as jest.MockedFunction<typeof getCards>;

beforeEach(() => {
  mockedGetCards.mockReset();
});

describe("mergeUniqueCards", () => {
  it("appends new cards", () => {
    expect(mergeUniqueCards([SPELL], [MINION])).toEqual([SPELL, MINION]);
  });

  it("drops a card already present by full identity", () => {
    expect(mergeUniqueCards([SPELL], [SPELL, MINION])).toEqual([SPELL, MINION]);
  });

  it("dedupes identical cards within the incoming batch", () => {
    expect(mergeUniqueCards([], [SPELL, SPELL])).toEqual([SPELL]);
  });

  it("returns the same reference when nothing is added", () => {
    const existing = [SPELL];
    expect(mergeUniqueCards(existing, [SPELL])).toBe(existing);
  });

  it("keeps reprints that share a slug but differ in printing", () => {
    // The real API returns 4305 cards across only 3694 slugs; collapsing on
    // slug silently dropped ~611 of them.
    expect(mergeUniqueCards([MINION], [MINION_REPRINT])).toEqual([MINION, MINION_REPRINT]);
  });

  it("keeps a same-slug reprint arriving in the same batch", () => {
    expect(mergeUniqueCards([], [MINION, MINION_REPRINT])).toHaveLength(2);
  });
});

describe("useCards", () => {
  it("fetches page 1 at 12 per page on mount", async () => {
    mockedGetCards.mockResolvedValue(makeResponse([SPELL]));

    await renderHook(() => useCards());

    await waitFor(() => expect(mockedGetCards).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 12 })));
  });

  it("exposes the loaded cards and totals", async () => {
    mockedGetCards.mockResolvedValue(makeResponse([SPELL, MINION], { cardCount: 4305, pageCount: 359 }));

    const { result } = await renderHook(() => useCards());

    await waitFor(() => expect(result.current.cards).toHaveLength(2));
    expect(result.current.totalCount).toBe(4305);
    expect(result.current.loadedCount).toBe(2);
    expect(result.current.hasMore).toBe(true);
  });

  it("reports initial loading while the first page is in flight", async () => {
    let resolvePage: (value: ReturnType<typeof makeResponse>) => void = () => {};
    mockedGetCards.mockReturnValue(
      new Promise(resolve => {
        resolvePage = resolve;
      }),
    );

    const { result } = await renderHook(() => useCards());

    expect(result.current.isInitialLoading).toBe(true);
    expect(result.current.isLoadingMore).toBe(false);

    await act(async () => {
      resolvePage(makeResponse([SPELL]));
    });

    expect(result.current.isInitialLoading).toBe(false);
  });

  it("reports loadingMore rather than initial loading once cards exist", async () => {
    mockedGetCards.mockResolvedValueOnce(makeResponse([SPELL]));
    const { result } = await renderHook(() => useCards());
    await waitFor(() => expect(result.current.cards).toHaveLength(1));

    mockedGetCards.mockReturnValue(new Promise(() => {}));
    await act(async () => {
      result.current.loadMore();
    });

    expect(result.current.isLoadingMore).toBe(true);
    expect(result.current.isInitialLoading).toBe(false);
  });

  it("appends the next page when loadMore is called", async () => {
    mockedGetCards.mockResolvedValueOnce(makeResponse([SPELL])).mockResolvedValueOnce(makeResponse([MINION], { page: "2" }));

    const { result } = await renderHook(() => useCards());
    await waitFor(() => expect(result.current.cards).toHaveLength(1));

    await act(async () => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.cards).toHaveLength(2));
    expect(mockedGetCards).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
    expect(result.current.cards.map(c => c.slug)).toEqual(["fireball", "chillwind-yeti"]);
  });

  it("does not request past the last page", async () => {
    mockedGetCards.mockResolvedValue(makeResponse([SPELL], { pageCount: 1, cardCount: 1 }));

    const { result } = await renderHook(() => useCards());
    await waitFor(() => expect(result.current.cards).toHaveLength(1));
    expect(result.current.hasMore).toBe(false);

    await act(async () => {
      result.current.loadMore();
    });

    expect(mockedGetCards).toHaveBeenCalledTimes(1);
  });

  it("ignores duplicate loadMore calls while a page is in flight", async () => {
    mockedGetCards.mockResolvedValueOnce(makeResponse([SPELL]));
    mockedGetCards.mockImplementation(() => new Promise(() => {}) as ReturnType<typeof getCards>);

    const { result } = await renderHook(() => useCards());
    await waitFor(() => expect(result.current.cards).toHaveLength(1));

    await act(async () => {
      result.current.loadMore();
      result.current.loadMore();
      result.current.loadMore();
    });

    // page 1 on mount + exactly one page 2 request
    await waitFor(() => expect(mockedGetCards).toHaveBeenCalledTimes(2));
  });

  it("surfaces the service error message", async () => {
    mockedGetCards.mockRejectedValue(new ApiError({ key: "errors.rateLimit" }));

    const { result } = await renderHook(() => useCards());

    await waitFor(() => expect(result.current.error).toEqual({ key: "errors.rateLimit" }));
    expect(result.current.cards).toEqual([]);
  });

  it("refetches the failed page on retry", async () => {
    mockedGetCards.mockRejectedValueOnce(new ApiError({ key: "errors.network" }));

    const { result } = await renderHook(() => useCards());
    await waitFor(() => expect(result.current.error).toEqual({ key: "errors.network" }));

    mockedGetCards.mockResolvedValueOnce(makeResponse([WEAPON]));
    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.cards).toHaveLength(1));
    expect(result.current.error).toBeNull();
  });

  it("clears a previous error when a later page succeeds", async () => {
    mockedGetCards.mockRejectedValueOnce(new ApiError({ key: "errors.unknown" }));
    const { result } = await renderHook(() => useCards());
    await waitFor(() => expect(result.current.error).toEqual({ key: "errors.unknown" }));

    mockedGetCards.mockResolvedValueOnce(makeResponse([SPELL]));
    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.error).toBeNull());
  });

  it("tolerates a response with no cards array", async () => {
    mockedGetCards.mockResolvedValue(makeResponse(undefined as never, { pageCount: 1 }));

    const { result } = await renderHook(() => useCards());

    await waitFor(() => expect(result.current.isInitialLoading).toBe(false));
    expect(result.current.cards).toEqual([]);
  });
});
