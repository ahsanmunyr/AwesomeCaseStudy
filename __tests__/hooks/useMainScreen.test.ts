import { act, renderHook, waitFor } from "@testing-library/react-native";

jest.mock("../../src/services/cards.service", () => ({
  __esModule: true,
  DEFAULT_PAGE_SIZE: 12,
  getCards: jest.fn(),
}));

import { getCards } from "../../src/services/cards.service";
import { useMainScreen } from "../../src/screens/MainScreen/hooks/useMainScreen";
import { MINION, SPELL, WEAPON, makeCard, makeResponse } from "../fixtures/cards";

const mockedGetCards = getCards as jest.MockedFunction<typeof getCards>;

beforeEach(() => {
  mockedGetCards.mockReset();
});

describe("useMainScreen", () => {
  it("exposes the paged cards through the filter layer", async () => {
    mockedGetCards.mockResolvedValue(makeResponse([SPELL, MINION]));

    const { result } = await renderHook(() => useMainScreen());

    await waitFor(() => expect(result.current.cards).toHaveLength(2));
    expect(result.current.loadedCount).toBe(2);
    expect(result.current.visibleCount).toBe(2);
    expect(result.current.totalCount).toBe(4305);
  });

  it("reports visibleCount separately from loadedCount while filtering", async () => {
    mockedGetCards.mockResolvedValue(makeResponse([SPELL, MINION]));
    const { result } = await renderHook(() => useMainScreen());
    await waitFor(() => expect(result.current.cards).toHaveLength(2));

    await act(async () => result.current.selectType("spell"));

    expect(result.current.visibleCount).toBe(1);
    expect(result.current.loadedCount).toBe(2);
    expect(result.current.isFiltering).toBe(true);
  });

  it("fetches the next page when onEndReached fires", async () => {
    mockedGetCards.mockResolvedValueOnce(makeResponse([SPELL])).mockResolvedValueOnce(makeResponse([WEAPON], { page: "2" }));

    const { result } = await renderHook(() => useMainScreen());
    await waitFor(() => expect(result.current.cards).toHaveLength(1));

    await act(async () => {
      result.current.onScrollBegin();
      result.current.onEndReached();
    });

    await waitFor(() => expect(result.current.cards).toHaveLength(2));
    expect(mockedGetCards).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
  });

  it("does not auto-page while a type filter is active", async () => {
    mockedGetCards.mockResolvedValue(makeResponse([SPELL, MINION]));

    const { result } = await renderHook(() => useMainScreen());
    await waitFor(() => expect(result.current.cards).toHaveLength(2));

    await act(async () => result.current.selectType("spell"));
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      result.current.onScrollBegin();
      result.current.onEndReached();
    });
    await act(async () => {
      result.current.onScrollBegin();
      result.current.onEndReached();
    });

    // Still only the page-1 request from mount.
    expect(mockedGetCards).toHaveBeenCalledTimes(1);
  });

  it("does not auto-page while a search term is active", async () => {
    mockedGetCards.mockResolvedValue(makeResponse([SPELL, MINION]));

    const { result } = await renderHook(() => useMainScreen());
    await waitFor(() => expect(result.current.cards).toHaveLength(2));

    await act(async () => result.current.setSearch("fire"));
    await waitFor(() => expect(result.current.isFiltering).toBe(true));

    await act(async () => {
      result.current.onScrollBegin();
      result.current.onEndReached();
    });

    expect(mockedGetCards).toHaveBeenCalledTimes(1);
  });

  it("still allows an explicit loadMore while filtering", async () => {
    mockedGetCards.mockResolvedValueOnce(makeResponse([SPELL, MINION])).mockResolvedValueOnce(makeResponse([WEAPON], { page: "2" }));

    const { result } = await renderHook(() => useMainScreen());
    await waitFor(() => expect(result.current.cards).toHaveLength(2));

    await act(async () => result.current.selectType("weapon"));
    expect(result.current.cards).toHaveLength(0);

    await act(async () => result.current.loadMore());

    await waitFor(() => expect(result.current.cards).toHaveLength(1));
    expect(result.current.cards[0].slug).toBe("fiery-war-axe");
  });

  it("resumes auto-paging once filters are cleared", async () => {
    mockedGetCards.mockResolvedValueOnce(makeResponse([SPELL, MINION])).mockResolvedValueOnce(makeResponse([WEAPON], { page: "2" }));

    const { result } = await renderHook(() => useMainScreen());
    await waitFor(() => expect(result.current.cards).toHaveLength(2));

    await act(async () => result.current.selectType("spell"));
    await act(async () => {
      result.current.onScrollBegin();
      result.current.onEndReached();
    });
    expect(mockedGetCards).toHaveBeenCalledTimes(1);

    await act(async () => result.current.clearFilters());
    await act(async () => {
      result.current.onScrollBegin();
      result.current.onEndReached();
    });

    await waitFor(() => expect(mockedGetCards).toHaveBeenCalledTimes(2));
  });

  it("ignores onEndReached once the last page is loaded", async () => {
    mockedGetCards.mockResolvedValue(makeResponse([SPELL], { pageCount: 1, cardCount: 1 }));

    const { result } = await renderHook(() => useMainScreen());
    await waitFor(() => expect(result.current.hasMore).toBe(false));

    await act(async () => {
      result.current.onScrollBegin();
      result.current.onEndReached();
    });

    expect(mockedGetCards).toHaveBeenCalledTimes(1);
  });

  it("ignores onEndReached while a page is already loading", async () => {
    mockedGetCards.mockResolvedValueOnce(makeResponse([SPELL]));
    const { result } = await renderHook(() => useMainScreen());
    await waitFor(() => expect(result.current.cards).toHaveLength(1));

    mockedGetCards.mockReturnValue(new Promise(() => {}));
    await act(async () => {
      result.current.onScrollBegin();
      result.current.onEndReached();
    });
    expect(result.current.isLoadingMore).toBe(true);

    await act(async () => {
      result.current.onScrollBegin();
      result.current.onEndReached();
    });

    // mount + the single in-flight page 2 request
    expect(mockedGetCards).toHaveBeenCalledTimes(2);
  });

  it("clears filters back to the full loaded set", async () => {
    mockedGetCards.mockResolvedValue(makeResponse([SPELL, MINION]));
    const { result } = await renderHook(() => useMainScreen());
    await waitFor(() => expect(result.current.cards).toHaveLength(2));

    await act(async () => result.current.selectRarity("legendary"));
    expect(result.current.cards).toHaveLength(0);

    await act(async () => result.current.clearFilters());
    expect(result.current.cards).toHaveLength(2);
  });
});

describe("useMainScreen scroll gating", () => {
  it("ignores onEndReached before the user has scrolled", async () => {
    mockedGetCards.mockResolvedValue(makeResponse([SPELL, MINION]));

    const { result } = await renderHook(() => useMainScreen());
    await waitFor(() => expect(result.current.cards).toHaveLength(2));

    // FlashList fires this during first layout; it must not fetch page 2.
    await act(async () => result.current.onEndReached());

    expect(mockedGetCards).toHaveBeenCalledTimes(1);
  });

  it("loads exactly one page on mount", async () => {
    mockedGetCards.mockResolvedValue(makeResponse([SPELL, MINION]));

    const { result } = await renderHook(() => useMainScreen());
    await waitFor(() => expect(result.current.loadedCount).toBe(2));

    expect(mockedGetCards).toHaveBeenCalledTimes(1);
    expect(mockedGetCards).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
  });

  it("paginates once a real scroll has happened", async () => {
    mockedGetCards.mockResolvedValueOnce(makeResponse([SPELL])).mockResolvedValueOnce(makeResponse([WEAPON], { page: "2" }));

    const { result } = await renderHook(() => useMainScreen());
    await waitFor(() => expect(result.current.cards).toHaveLength(1));

    await act(async () => {
      result.current.onScrollBegin();
      result.current.onEndReached();
    });

    await waitFor(() => expect(mockedGetCards).toHaveBeenCalledTimes(2));
  });

  it("keeps same-slug reprints so two pages of 12 yield 24 cards", async () => {
    const pageOne = Array.from({ length: 12 }, (_, i) => makeCard({ slug: "reprint", name: "Reprint", cardSetSlug: `set-a-${i}` }));
    const pageTwo = Array.from({ length: 12 }, (_, i) => makeCard({ slug: "reprint", name: "Reprint", cardSetSlug: `set-b-${i}` }));
    mockedGetCards.mockResolvedValueOnce(makeResponse(pageOne)).mockResolvedValueOnce(makeResponse(pageTwo, { page: "2" }));

    const { result } = await renderHook(() => useMainScreen());
    await waitFor(() => expect(result.current.loadedCount).toBe(12));

    await act(async () => {
      result.current.onScrollBegin();
      result.current.onEndReached();
    });

    await waitFor(() => expect(result.current.loadedCount).toBe(24));
  });
});
