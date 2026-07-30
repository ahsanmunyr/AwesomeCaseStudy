import { CardWithId } from "../../../../types/heartstone-api/type";
import { CLASS_ICONS } from "../../../config/baseURLs";

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

function collectOptions(cards: CardWithId[], getOption: (card: CardWithId) => FilterOption | null | undefined): FilterOption[] {
  const optionsBySlug = new Map<string, FilterOption>();

  for (const card of cards) {
    const option = getOption(card);
    if (option?.slug && !optionsBySlug.has(option.slug)) {
      optionsBySlug.set(option.slug, { slug: option.slug, name: option.name });
    }
  }

  return [...optionsBySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function deriveFilterOptions(cards: CardWithId[]): FilterOptions {
  return {
    types: collectOptions(cards, card => card.type),
    classes: collectOptions(cards, card => card.class),
    rarities: collectOptions(cards, card => card.rarity),
  };
}

export function matchesSearch(card: CardWithId, search: string): boolean {
  const term = search.trim().toLowerCase();
  if (!term) {
    return true;
  }
  return card.name?.toLowerCase().includes(term) ?? false;
}

export function filterCards(cards: CardWithId[], filters: ActiveFilters): CardWithId[] {
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

export const cleanCardText = (text?: string): string => {
  if (!text) {
    return "";
  }
  return text
    .replace(/<[^>]*>?/gm, "")
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const getClassIconUrl = (className?: string): string => {
  if (!className) return CLASS_ICONS["Neutral"];
  const key = Object.keys(CLASS_ICONS).find(k => k.toLowerCase() === className.trim().toLowerCase());
  return key ? CLASS_ICONS[key] : CLASS_ICONS["Neutral"];
};
