import { cardIdentity } from "../../src/screens/MainScreen/utils/cardIdentity";
import { MINION, MINION_REPRINT, SPELL, makeCard } from "../fixtures/cards";

describe("cardIdentity", () => {
  it("is stable for the same card", () => {
    expect(cardIdentity(MINION)).toBe(cardIdentity(MINION));
  });

  it("differs between different cards", () => {
    expect(cardIdentity(MINION)).not.toBe(cardIdentity(SPELL));
  });

  it("separates reprints that share a slug", () => {
    expect(MINION_REPRINT.slug).toBe(MINION.slug);
    expect(cardIdentity(MINION_REPRINT)).not.toBe(cardIdentity(MINION));
  });

  it("separates same-slug cards that differ only in stats", () => {
    const oneOne = makeCard({ slug: "abusive-sergeant", attack: 1, health: 1 });
    const twoOne = makeCard({ slug: "abusive-sergeant", attack: 2, health: 1 });
    expect(cardIdentity(oneOne)).not.toBe(cardIdentity(twoOne));
  });

  it("separates same-slug cards that differ only in card set", () => {
    const core = makeCard({ slug: "abomination", cardSetSlug: "core" });
    const classic = makeCard({ slug: "abomination", cardSetSlug: "classic-cards" });
    expect(cardIdentity(core)).not.toBe(cardIdentity(classic));
  });

  it("handles a null card set without throwing", () => {
    expect(() => cardIdentity(makeCard({ slug: "x", cardSetSlug: null }))).not.toThrow();
  });

  it("produces no collisions across a mixed set of cards", () => {
    const cards = [
      MINION,
      MINION_REPRINT,
      SPELL,
      makeCard({ slug: "abomination", cardSetSlug: "core", copyOfCardId: 440 }),
      makeCard({ slug: "abomination", cardSetSlug: "classic-cards", copyOfCardId: 440 }),
      makeCard({ slug: "abomination", cardSetSlug: null }),
    ];
    expect(new Set(cards.map(cardIdentity)).size).toBe(cards.length);
  });
});
