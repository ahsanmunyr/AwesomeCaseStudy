import {
  EMPTY_FILTERS,
  countActiveFilters,
  deriveFilterOptions,
  filterCards,
  matchesSearch,
} from "../../src/screens/MainScreen/utils/cardFilters";
import { LEGENDARY_MINION, MINION, SPELL, WEAPON, makeCard } from "../fixtures/cards";

const ALL = [MINION, SPELL, WEAPON, LEGENDARY_MINION];

describe("deriveFilterOptions", () => {
  it("returns empty option lists for no cards", () => {
    expect(deriveFilterOptions([])).toEqual({
      types: [],
      classes: [],
      rarities: [],
    });
  });

  it("collects unique types across cards", () => {
    expect(deriveFilterOptions(ALL).types).toEqual([
      { slug: "minion", name: "Minion" },
      { slug: "spell", name: "Spell" },
      { slug: "weapon", name: "Weapon" },
    ]);
  });

  it("deduplicates repeated slugs", () => {
    const duplicated = [MINION, LEGENDARY_MINION, MINION];
    expect(deriveFilterOptions(duplicated).types).toHaveLength(1);
  });

  it("sorts options alphabetically by name", () => {
    const names = deriveFilterOptions(ALL).rarities.map(o => o.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("collects unique classes", () => {
    expect(deriveFilterOptions(ALL).classes.map(o => o.slug)).toEqual(["mage", "neutral", "warrior"]);
  });
});

describe("matchesSearch", () => {
  it("matches everything when the term is blank", () => {
    expect(matchesSearch(SPELL, "")).toBe(true);
    expect(matchesSearch(SPELL, "   ")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(matchesSearch(SPELL, "FIRE")).toBe(true);
  });

  it("matches on a partial name", () => {
    expect(matchesSearch(LEGENDARY_MINION, "firelord")).toBe(true);
  });

  it("ignores surrounding whitespace", () => {
    expect(matchesSearch(SPELL, "  fireball  ")).toBe(true);
  });

  it("returns false when nothing matches", () => {
    expect(matchesSearch(SPELL, "polymorph")).toBe(false);
  });
});

describe("filterCards", () => {
  it("returns the original array when no filters are active", () => {
    expect(filterCards(ALL, EMPTY_FILTERS)).toBe(ALL);
  });

  it("filters by type", () => {
    const result = filterCards(ALL, { ...EMPTY_FILTERS, type: "minion" });
    expect(result.map(c => c.slug)).toEqual(["chillwind-yeti", "ragnaros"]);
  });

  it("filters by class", () => {
    const result = filterCards(ALL, { ...EMPTY_FILTERS, cardClass: "mage" });
    expect(result).toEqual([SPELL]);
  });

  it("filters by rarity", () => {
    const result = filterCards(ALL, { ...EMPTY_FILTERS, rarity: "legendary" });
    expect(result).toEqual([LEGENDARY_MINION]);
  });

  it("combines filters with AND semantics", () => {
    const result = filterCards(ALL, {
      ...EMPTY_FILTERS,
      type: "minion",
      rarity: "legendary",
    });
    expect(result).toEqual([LEGENDARY_MINION]);
  });

  it("applies search alongside dropdown filters", () => {
    const result = filterCards(ALL, {
      ...EMPTY_FILTERS,
      type: "minion",
      search: "yeti",
    });
    expect(result).toEqual([MINION]);
  });

  it("returns an empty array when filters exclude everything", () => {
    const result = filterCards(ALL, {
      ...EMPTY_FILTERS,
      type: "weapon",
      cardClass: "mage",
    });
    expect(result).toEqual([]);
  });

  it("does not throw on cards with missing nested fields", () => {
    const broken = { ...makeCard({ slug: "broken" }) } as any;
    delete broken.type;
    delete broken.rarity;
    expect(() => filterCards([broken], { ...EMPTY_FILTERS, type: "spell" })).not.toThrow();
    expect(filterCards([broken], { ...EMPTY_FILTERS, type: "spell" })).toEqual([]);
  });
});

describe("countActiveFilters", () => {
  it("counts only the dropdown filters, not search", () => {
    expect(countActiveFilters({ ...EMPTY_FILTERS, search: "fire" })).toBe(0);
    expect(countActiveFilters({ ...EMPTY_FILTERS, type: "spell", rarity: "rare" })).toBe(2);
  });
});
