import { Card, CardWithId } from "../../types/heartstone-api/type";

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

export function withCardIds(cards: Card[]): CardWithId[] {
  return cards.map(card => ({ ...card, id: cardIdentity(card) }));
}
