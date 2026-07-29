export interface HearthstoneResponse {
  cards: Card[];
  cardCount: number;
  pageCount: number;
  page: string;
}

export interface CardWithId extends Card {
  id: string;
}

export interface CardsPage {
  cards: CardWithId[];
  cardCount: number;
  pageCount: number;
  page: string;
}

export interface Card {
  collectible: number;
  slug: string;
  artistName: string;
  manaCost: number;
  name: string;
  text: string;
  flavorText: string;
  hasImage: boolean;
  hasImageGold: boolean;
  hasCropImage: boolean;
  keywords: Keyword[];
  rarity: Rarity;
  class: CardClass;
  type: CardType;
  cardSet: CardSet | null;
  spellSchool: SpellSchool | null;
  health?: number;
  attack?: number;
  duels?: Duels;
  copyOfCardId?: number;
  minionTypeId?: number;
}

export interface Duels {
  relevant: boolean;
  constructed: boolean;
}

export interface Keyword {
  slug: string;
  name: string;
  refText: string;
  text: string;
  gameModes: GameMode[];
}

export interface GameMode {
  slug: string;
  name: string;
}

export interface Rarity {
  slug: string;
  craftingCost: [number, number];
  dustValue: [number, number];
  name: string;
}

export interface CardClass {
  slug: string;
  name: string;
}

export interface CardType {
  slug: string;
  name: string;
  gameModes: GameMode[];
}

export interface CardSet {
  name: string;
  slug: string;
  type: string;
  collectibleCount: number;
  collectibleRevealedCount: number;
  nonCollectibleCount: number;
  nonCollectibleRevealedCount: number;
}

export interface SpellSchool {
  slug: string;
  name: string;
}
