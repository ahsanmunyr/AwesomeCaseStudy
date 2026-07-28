import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useCardFilters, UseCardFiltersResult } from "../../src/screens/MainScreen/hooks/useCardFilters";
import { Card } from "../../types/heartstone-api/type";
import { LEGENDARY_MINION, MINION, SPELL, WEAPON } from "../fixtures/cards";

const ALL = [MINION, SPELL, WEAPON, LEGENDARY_MINION];

describe("useCardFilters", () => {
  it("returns every card when nothing is filtered", async () => {
    const { result } = await renderHook(() => useCardFilters(ALL));
    expect(result.current.filteredCards).toEqual(ALL);
    expect(result.current.isFiltering).toBe(false);
  });

  it("derives dropdown options from the loaded cards", async () => {
    const { result } = await renderHook(() => useCardFilters(ALL));

    expect(result.current.options.types.map(o => o.slug)).toEqual(["minion", "spell", "weapon"]);
    expect(result.current.options.rarities.map(o => o.slug)).toEqual(["common", "epic", "legendary"]);
  });

  it("grows the type options as more cards are paged in", async () => {
    const { result, rerender } = await renderHook<UseCardFiltersResult, { cards: Card[] }>(({ cards }) => useCardFilters(cards), {
      initialProps: { cards: [SPELL] },
    });
    expect(result.current.options.types).toHaveLength(1);

    await rerender({ cards: [SPELL, WEAPON] });
    expect(result.current.options.types.map(o => o.slug)).toEqual(["spell", "weapon"]);
  });

  it("narrows the list when a type is selected", async () => {
    const { result } = await renderHook(() => useCardFilters(ALL));

    await act(async () => result.current.selectType("minion"));

    expect(result.current.filteredCards.map(c => c.slug)).toEqual(["chillwind-yeti", "ragnaros"]);
    expect(result.current.activeFilterCount).toBe(1);
    expect(result.current.isFiltering).toBe(true);
  });

  it("combines type and rarity selections", async () => {
    const { result } = await renderHook(() => useCardFilters(ALL));

    await act(async () => {
      result.current.selectType("minion");
      result.current.selectRarity("legendary");
    });

    expect(result.current.filteredCards).toEqual([LEGENDARY_MINION]);
    expect(result.current.activeFilterCount).toBe(2);
  });

  it("applies search only after the debounce elapses", async () => {
    const { result } = await renderHook(() => useCardFilters(ALL));

    await act(async () => result.current.setSearch("yeti"));

    // Debounced value has not settled yet, so the list is untouched.
    expect(result.current.search).toBe("yeti");
    expect(result.current.filteredCards).toEqual(ALL);

    await waitFor(() => expect(result.current.filteredCards).toEqual([MINION]));
  });

  it("clears search and every dropdown", async () => {
    const { result } = await renderHook(() => useCardFilters(ALL));

    await act(async () => {
      result.current.selectType("minion");
      result.current.selectClass("neutral");
      result.current.selectRarity("legendary");
      result.current.setSearch("rag");
    });
    await waitFor(() => expect(result.current.activeFilterCount).toBe(3));

    await act(async () => result.current.clearFilters());

    await waitFor(() => {
      expect(result.current.filteredCards).toEqual(ALL);
    });
    expect(result.current.search).toBe("");
    expect(result.current.activeFilterCount).toBe(0);
    expect(result.current.isFiltering).toBe(false);
  });

  it("deselecting a dropdown restores the full list", async () => {
    const { result } = await renderHook(() => useCardFilters(ALL));

    await act(async () => result.current.selectType("weapon"));
    expect(result.current.filteredCards).toEqual([WEAPON]);

    await act(async () => result.current.selectType(null));
    expect(result.current.filteredCards).toEqual(ALL);
  });

  it("returns an empty list when filters match nothing", async () => {
    const { result } = await renderHook(() => useCardFilters(ALL));

    await act(async () => {
      result.current.selectType("weapon");
      result.current.selectClass("mage");
    });

    expect(result.current.filteredCards).toEqual([]);
  });

  it("keeps callbacks referentially stable across renders", async () => {
    const { result, rerender } = await renderHook<UseCardFiltersResult, { cards: Card[] }>(({ cards }) => useCardFilters(cards), {
      initialProps: { cards: ALL },
    });

    const first = {
      selectType: result.current.selectType,
      clearFilters: result.current.clearFilters,
      setSearch: result.current.setSearch,
    };

    await rerender({ cards: [...ALL] });

    expect(result.current.selectType).toBe(first.selectType);
    expect(result.current.clearFilters).toBe(first.clearFilters);
    expect(result.current.setSearch).toBe(first.setSearch);
  });
});
