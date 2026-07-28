import { Card } from "../../../../types/heartstone-api/type";

/**
 * The API exposes no id, and `slug` is NOT unique: 4305 cards share only 3694
 * slugs because reprints repeat one across sets, sometimes with different stats
 * (Abusive Sergeant ships as both 1/1 and 2/1). Keying on slug therefore drops
 * ~611 real cards and produces duplicate React keys.
 *
 * Verified against the full dataset: this composite yields 4305 unique keys
 * with zero collisions.
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

export default cardIdentity;
