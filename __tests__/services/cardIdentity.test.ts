import { cardIdentity, withCardIds } from "../../src/services/cardIdentity";
import { makeCard } from "../fixtures/cards";

const YETI = makeCard({ slug: "chillwind-yeti", name: "Chillwind Yeti", manaCost: 4, attack: 4, health: 5 });
const YETI_REPRINT = makeCard({ slug: "chillwind-yeti", name: "Chillwind Yeti", manaCost: 4, attack: 5, health: 5, cardSetSlug: "core" });
const FIREBALL = makeCard({ slug: "fireball", name: "Fireball" });

describe("cardIdentity", () => {
  it("gives the same id for the same card", () => {
    expect(cardIdentity(YETI)).toBe(cardIdentity(YETI));
  });

  it("gives different ids to different cards", () => {
    expect(cardIdentity(YETI)).not.toBe(cardIdentity(FIREBALL));
  });

  it("keeps a reprint apart from the original, even with the same slug", () => {
    expect(YETI_REPRINT.slug).toBe(YETI.slug);
    expect(cardIdentity(YETI_REPRINT)).not.toBe(cardIdentity(YETI));
  });
});

describe("withCardIds", () => {
  it("adds an id to every card", () => {
    const cards = withCardIds([YETI, FIREBALL]);

    expect(cards).toHaveLength(2);
    expect(cards[0].id).toBe(cardIdentity(YETI));
    expect(cards[1].id).toBe(cardIdentity(FIREBALL));
  });

  it("keeps everything else about the card unchanged", () => {
    const [card] = withCardIds([FIREBALL]);

    expect(card.name).toBe("Fireball");
    expect(card.slug).toBe("fireball");
  });

  it("gives every card of a page a different id", () => {
    const ids = withCardIds([YETI, YETI_REPRINT, FIREBALL]).map(card => card.id);

    expect(new Set(ids).size).toBe(3);
  });

  it("copes with an empty page", () => {
    expect(withCardIds([])).toEqual([]);
  });
});
