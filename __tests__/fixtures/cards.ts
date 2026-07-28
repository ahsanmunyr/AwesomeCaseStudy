import { Card, HearthstoneResponse } from "../../types/heartstone-api/type";

interface Overrides {
  slug?: string;
  name?: string;
  cardSetSlug?: string | null;
  copyOfCardId?: number;
  type?: { slug: string; name: string };
  cardClass?: { slug: string; name: string };
  rarity?: { slug: string; name: string };
  manaCost?: number;
  attack?: number;
  health?: number;
}

export function makeCard(overrides: Overrides = {}): Card {
  const slug = overrides.slug ?? "fireball";
  const type = overrides.type ?? { slug: "spell", name: "Spell" };
  const cardClass = overrides.cardClass ?? { slug: "mage", name: "Mage" };
  const rarity = overrides.rarity ?? { slug: "common", name: "Common" };

  return {
    collectible: 1,
    slug,
    artistName: "Test Artist",
    manaCost: overrides.manaCost ?? 4,
    name: overrides.name ?? "Fireball",
    text: "Deal 6 damage.",
    flavorText: "This spell is useful for burning things.",
    hasImage: true,
    hasImageGold: false,
    hasCropImage: true,
    keywords: [],
    rarity: { ...rarity, craftingCost: [40, 400], dustValue: [5, 50] },
    class: cardClass,
    type: { ...type, gameModes: [] },
    cardSet:
      overrides.cardSetSlug == null
        ? null
        : {
            name: overrides.cardSetSlug,
            slug: overrides.cardSetSlug,
            type: "expansion",
            collectibleCount: 0,
            collectibleRevealedCount: 0,
            nonCollectibleCount: 0,
            nonCollectibleRevealedCount: 0,
          },
    spellSchool: null,
    ...(overrides.copyOfCardId !== undefined ? { copyOfCardId: overrides.copyOfCardId } : {}),
    ...(overrides.attack !== undefined ? { attack: overrides.attack } : {}),
    ...(overrides.health !== undefined ? { health: overrides.health } : {}),
  };
}

export const MINION = makeCard({
  slug: "chillwind-yeti",
  name: "Chillwind Yeti",
  type: { slug: "minion", name: "Minion" },
  cardClass: { slug: "neutral", name: "Neutral" },
  rarity: { slug: "common", name: "Common" },
  manaCost: 4,
  attack: 4,
  health: 5,
});

export const SPELL = makeCard({
  slug: "fireball",
  name: "Fireball",
  type: { slug: "spell", name: "Spell" },
  cardClass: { slug: "mage", name: "Mage" },
  rarity: { slug: "common", name: "Common" },
});

export const WEAPON = makeCard({
  slug: "fiery-war-axe",
  name: "Fiery War Axe",
  type: { slug: "weapon", name: "Weapon" },
  cardClass: { slug: "warrior", name: "Warrior" },
  rarity: { slug: "epic", name: "Epic" },
});

export const LEGENDARY_MINION = makeCard({
  slug: "ragnaros",
  name: "Ragnaros the Firelord",
  type: { slug: "minion", name: "Minion" },
  cardClass: { slug: "neutral", name: "Neutral" },
  rarity: { slug: "legendary", name: "Legendary" },
  manaCost: 8,
  attack: 8,
  health: 8,
});

export function makeResponse(cards: Card[], overrides: Partial<HearthstoneResponse> = {}): HearthstoneResponse {
  return {
    cards,
    cardCount: 4305,
    pageCount: 359,
    page: "1",
    ...overrides,
  };
}

/**
 * Same slug and name as MINION but a different printing - the API really does
 * return these as separate cards (Abusive Sergeant ships as both 1/1 and 2/1).
 */
export const MINION_REPRINT = makeCard({
  slug: "chillwind-yeti",
  name: "Chillwind Yeti",
  type: { slug: "minion", name: "Minion" },
  cardClass: { slug: "neutral", name: "Neutral" },
  rarity: { slug: "common", name: "Common" },
  manaCost: 4,
  attack: 5,
  health: 5,
  cardSetSlug: "core",
  copyOfCardId: 242,
});
