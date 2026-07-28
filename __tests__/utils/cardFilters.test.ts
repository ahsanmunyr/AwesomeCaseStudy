import { countActiveFilters, deriveFilterOptions, filterCards, matchesSearch } from "../../src/screens/MainScreen/utils/cardFilters";
import { LEGENDARY_MINION, MINION, SPELL, WEAPON } from "../fixtures/cards";

const ALL_CARDS = [MINION, SPELL, WEAPON, LEGENDARY_MINION];

const NO_FILTERS = { search: "", type: null, cardClass: null, rarity: null };

describe("matchesSearch", () => {
  it("matches part of the name, ignoring upper and lower case", () => {
    expect(matchesSearch(SPELL, "FIRE")).toBe(true);
  });

  it("ignores spaces around the search text", () => {
    expect(matchesSearch(SPELL, "  fire  ")).toBe(true);
  });

  it("does not match a different card", () => {
    expect(matchesSearch(SPELL, "yeti")).toBe(false);
  });

  it("matches everything when the search box is empty", () => {
    expect(matchesSearch(SPELL, "")).toBe(true);
  });
});

describe("filterCards", () => {
  it("returns every card when nothing is selected", () => {
    expect(filterCards(ALL_CARDS, NO_FILTERS)).toEqual(ALL_CARDS);
  });

  it("keeps only the chosen type", () => {
    const result = filterCards(ALL_CARDS, { ...NO_FILTERS, type: "minion" });

    expect(result).toEqual([MINION, LEGENDARY_MINION]);
  });

  it("keeps only the chosen class", () => {
    const result = filterCards(ALL_CARDS, { ...NO_FILTERS, cardClass: "mage" });

    expect(result).toEqual([SPELL]);
  });

  it("keeps only the chosen rarity", () => {
    const result = filterCards(ALL_CARDS, { ...NO_FILTERS, rarity: "legendary" });

    expect(result).toEqual([LEGENDARY_MINION]);
  });

  it("applies the search and the dropdowns together", () => {
    const result = filterCards(ALL_CARDS, { ...NO_FILTERS, type: "minion", search: "ragnaros" });

    expect(result).toEqual([LEGENDARY_MINION]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterCards(ALL_CARDS, { ...NO_FILTERS, search: "no such card" })).toEqual([]);
  });
});

describe("deriveFilterOptions", () => {
  it("lists each type only once, sorted by name", () => {
    const options = deriveFilterOptions(ALL_CARDS);

    expect(options.types.map(option => option.slug)).toEqual(["minion", "spell", "weapon"]);
  });

  it("lists the classes and rarities of the loaded cards", () => {
    const options = deriveFilterOptions(ALL_CARDS);

    expect(options.classes.map(option => option.slug)).toEqual(["mage", "neutral", "warrior"]);
    expect(options.rarities.map(option => option.slug)).toEqual(["common", "epic", "legendary"]);
  });

  it("gives empty lists when no card is loaded yet", () => {
    expect(deriveFilterOptions([])).toEqual({ types: [], classes: [], rarities: [] });
  });
});

describe("countActiveFilters", () => {
  it("counts only the dropdowns, not the search box", () => {
    expect(countActiveFilters({ ...NO_FILTERS, search: "fire" })).toBe(0);
    expect(countActiveFilters({ ...NO_FILTERS, type: "minion" })).toBe(1);
    expect(countActiveFilters({ search: "", type: "minion", cardClass: "mage", rarity: "epic" })).toBe(3);
  });
});
