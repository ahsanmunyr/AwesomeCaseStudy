import { Card } from "../../../../types/heartstone-api/type";

export interface FilterOption {
  slug: string;
  name: string;
}

export interface FilterOptions {
  types: FilterOption[];
  classes: FilterOption[];
  rarities: FilterOption[];
}

export interface ActiveFilters {
  search: string;
  type: string | null;
  cardClass: string | null;
  rarity: string | null;
}

export const EMPTY_FILTERS: ActiveFilters = {
  search: "",
  type: null,
  cardClass: null,
  rarity: null,
};

function collect(cards: Card[], pick: (card: Card) => FilterOption | null | undefined): FilterOption[] {
  const bySlug = new Map<string, FilterOption>();
  for (const card of cards) {
    const value = pick(card);
    if (value?.slug && !bySlug.has(value.slug)) {
      bySlug.set(value.slug, { slug: value.slug, name: value.name });
    }
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Builds the dropdown options from the cards loaded so far. Because the API
 * ignores filter params, the option lists grow as more pages are paged in.
 */
export function deriveFilterOptions(cards: Card[]): FilterOptions {
  return {
    types: collect(cards, card => card.type),
    classes: collect(cards, card => card.class),
    rarities: collect(cards, card => card.rarity),
  };
}

/** Case-insensitive, whitespace-tolerant name match. */
export function matchesSearch(card: Card, search: string): boolean {
  const term = search.trim().toLowerCase();
  if (!term) {
    return true;
  }
  return card.name?.toLowerCase().includes(term) ?? false;
}

export function filterCards(cards: Card[], filters: ActiveFilters): Card[] {
  const { search, type, cardClass, rarity } = filters;
  if (!search.trim() && !type && !cardClass && !rarity) {
    return cards;
  }
  return cards.filter(card => {
    if (type && card.type?.slug !== type) {
      return false;
    }
    if (cardClass && card.class?.slug !== cardClass) {
      return false;
    }
    if (rarity && card.rarity?.slug !== rarity) {
      return false;
    }
    return matchesSearch(card, search);
  });
}

export function countActiveFilters(filters: ActiveFilters): number {
  return [filters.type, filters.cardClass, filters.rarity].filter(Boolean).length;
}
