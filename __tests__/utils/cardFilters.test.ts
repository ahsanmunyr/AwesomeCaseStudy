import { EMPTY_FILTERS, cleanCardText, filterCards } from "../../src/screens/MainScreen/utils/cardFilters";
import { LEGENDARY_MINION, MINION, SPELL, WEAPON } from "../fixtures/cards";

const LOADED = [MINION, SPELL, LEGENDARY_MINION, WEAPON];

describe("filterCards", () => {
  it("applies type, class, rarity and the name search together, and matches names case-insensitively", () => {
    expect(filterCards(LOADED, { search: "", type: "minion", cardClass: null, rarity: null })).toEqual([MINION, LEGENDARY_MINION]);
    expect(filterCards(LOADED, { search: "", type: "minion", cardClass: "neutral", rarity: "legendary" })).toEqual([LEGENDARY_MINION]);
    expect(filterCards(LOADED, { search: "  YETI ", type: null, cardClass: null, rarity: null })).toEqual([MINION]);
    expect(filterCards(LOADED, { search: "yeti", type: "spell", cardClass: null, rarity: null })).toEqual([]);
    expect(filterCards(LOADED, EMPTY_FILTERS)).toBe(LOADED);
  });
});

describe("cleanCardText", () => {
  it("strips the markup the API sends and collapses what is left", () => {
    expect(cleanCardText("<b>Battlecry:</b> Deal 2 damage.\\n")).toBe("Battlecry: Deal 2 damage.");
    expect(cleanCardText("<i>Taunt</i>\nDeal  6   damage ")).toBe("Taunt Deal 6 damage");
    expect(cleanCardText(undefined)).toBe("");
  });
});
