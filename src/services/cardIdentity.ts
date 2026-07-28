import { Card, CardWithId } from "../../types/heartstone-api/type";

/**
 * Builds a unique id for one card.
 *
 * The API gives us no id field, and the `slug` is not unique either: 4305 cards
 * share only 3694 slugs, because the same card is reprinted in several sets,
 * sometimes with different stats (Abusive Sergeant exists as both a 1/1 and a
 * 2/1).
 *
 * So using the slug alone would give React two rows with the same key. Joining
 * these six fields together gives 4305 different ids for 4305 cards, with no
 * repeats.
 */
export function cardIdentity(card: Card): string {
  return [
    card.slug,
    card.cardSet?.slug ?? "none",
    card.copyOfCardId ?? "0",
    card.manaCost ?? "",
    card.attack ?? "",
    card.health ?? "",
  ].join("|");
}

/**
 * Adds an id to every card of a page, right where the data arrives. After this
 * the rest of the app only ever sees cards that already have an id.
 */
export function withCardIds(cards: Card[]): CardWithId[] {
  return cards.map(card => ({ ...card, id: cardIdentity(card) }));
}
