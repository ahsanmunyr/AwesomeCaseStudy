import { act, renderHook, waitFor } from "@testing-library/react-native";

// The hook must not make real network calls, so we replace the service.
jest.mock("../../src/services/cards.service", () => ({
  __esModule: true,
  DEFAULT_PAGE_SIZE: 12,
  getCards: jest.fn(),
}));

import { getCards } from "../../src/services/cards.service";
import { useMainScreen } from "../../src/screens/MainScreen/hooks/useMainScreen";
import { LEGENDARY_MINION, MINION, SPELL, WEAPON, makeResponse } from "../fixtures/cards";
import { ApiError } from "../../src/services/apiError";

const mockedGetCards = getCards as jest.MockedFunction<typeof getCards>;

const PAGE_ONE = [MINION, SPELL, LEGENDARY_MINION];

beforeEach(() => {
  mockedGetCards.mockReset();
  mockedGetCards.mockResolvedValue(makeResponse(PAGE_ONE));
});

/** Renders the hook and waits until the first page has arrived. */
async function renderLoaded() {
  const { result } = await renderHook(() => useMainScreen());
  await waitFor(() => expect(result.current.cards).toHaveLength(3));
  return result;
}

describe("useMainScreen - loading", () => {
  it("loads page 1 with 12 cards when the screen opens", async () => {
    await renderHook(() => useMainScreen());

    await waitFor(() => expect(mockedGetCards).toHaveBeenCalledWith(1, 12));
  });

  it("gives the screen the cards and the counts", async () => {
    const result = await renderLoaded();

    expect(result.current.loadedCount).toBe(3);
    expect(result.current.visibleCount).toBe(3);
    expect(result.current.totalCount).toBe(4305);
    expect(result.current.hasMore).toBe(true);
  });

  it("shows the first-load spinner until the first page arrives", async () => {
    mockedGetCards.mockReturnValue(new Promise(() => {}));

    const { result } = await renderHook(() => useMainScreen());

    expect(result.current.isInitialLoading).toBe(true);
    expect(result.current.isLoadingMore).toBe(false);
  });

  it("adds the next page under the cards we already have", async () => {
    mockedGetCards.mockResolvedValueOnce(makeResponse(PAGE_ONE)).mockResolvedValueOnce(makeResponse([WEAPON]));
    const result = await renderLoaded();

    await act(async () => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.cards).toHaveLength(4));
    expect(mockedGetCards).toHaveBeenLastCalledWith(2, 12);
  });

  it("does not load anything after the last page", async () => {
    mockedGetCards.mockResolvedValue(makeResponse(PAGE_ONE, { pageCount: 1 }));
    const result = await renderLoaded();
    expect(result.current.hasMore).toBe(false);

    await act(async () => {
      result.current.loadMore();
    });

    expect(mockedGetCards).toHaveBeenCalledTimes(1);
  });
});

describe("useMainScreen - errors", () => {
  it("reports an error when the request fails", async () => {
    mockedGetCards.mockRejectedValue(new ApiError({ key: "errors.rateLimit" }));

    const { result } = await renderHook(() => useMainScreen());

    await waitFor(() => expect(result.current.error).toEqual({ key: "errors.rateLimit" }));
    expect(result.current.cards).toEqual([]);
  });

  it("loads the failed page again on retry", async () => {
    mockedGetCards.mockRejectedValueOnce(new ApiError({ key: "errors.network" }));

    const { result } = await renderHook(() => useMainScreen());
    await waitFor(() => expect(result.current.error).not.toBeNull());

    mockedGetCards.mockResolvedValueOnce(makeResponse(PAGE_ONE));
    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.cards).toHaveLength(3));
    expect(result.current.error).toBeNull();
  });
});

describe("useMainScreen - search and filters", () => {
  it("builds the dropdown choices from the cards that are loaded", async () => {
    const result = await renderLoaded();

    expect(result.current.options.types.map(option => option.slug)).toEqual(["minion", "spell"]);
  });

  it("keeps only the cards of the chosen type", async () => {
    const result = await renderLoaded();

    await act(async () => {
      result.current.selectType("spell");
    });

    expect(result.current.cards).toEqual([SPELL]);
    expect(result.current.activeFilterCount).toBe(1);
    expect(result.current.isFiltering).toBe(true);
    // loadedCount counts everything downloaded, visibleCount only what is shown.
    expect(result.current.loadedCount).toBe(3);
    expect(result.current.visibleCount).toBe(1);
  });

  it("searches once the user stops typing", async () => {
    const result = await renderLoaded();

    await act(async () => {
      result.current.setSearch("yeti");
    });

    // The search box updates at once, the list only after the debounce.
    expect(result.current.search).toBe("yeti");
    await waitFor(() => expect(result.current.cards).toEqual([MINION]));
  });

  it("puts every card back when the filters are cleared", async () => {
    const result = await renderLoaded();

    await act(async () => {
      result.current.selectType("minion");
      result.current.selectRarity("legendary");
    });
    expect(result.current.cards).toEqual([LEGENDARY_MINION]);

    await act(async () => {
      result.current.clearFilters();
    });

    await waitFor(() => expect(result.current.cards).toHaveLength(3));
    expect(result.current.activeFilterCount).toBe(0);
  });
});

describe("useMainScreen - scrolling to the bottom", () => {
  it("does not load page 2 before the user has scrolled", async () => {
    const result = await renderLoaded();

    // FlashList fires this once while measuring itself, before any scrolling.
    await act(async () => {
      result.current.onEndReached();
    });

    expect(mockedGetCards).toHaveBeenCalledTimes(1);
  });

  it("loads page 2 once the user has really scrolled", async () => {
    const result = await renderLoaded();

    await act(async () => {
      result.current.onScrollBegin();
      result.current.onEndReached();
    });

    await waitFor(() => expect(mockedGetCards).toHaveBeenCalledTimes(2));
    expect(mockedGetCards).toHaveBeenLastCalledWith(2, 12);
  });

  it("does not auto-load while a filter is on", async () => {
    const result = await renderLoaded();

    await act(async () => {
      result.current.onScrollBegin();
      result.current.selectType("spell");
    });

    await act(async () => {
      result.current.onEndReached();
    });

    // Only the first page: while filtering, the user must press "Load more".
    expect(mockedGetCards).toHaveBeenCalledTimes(1);
  });
});
