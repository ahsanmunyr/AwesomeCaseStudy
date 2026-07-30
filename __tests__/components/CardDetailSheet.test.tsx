import React from "react";
import { fireEvent, screen } from "@testing-library/react-native";
import { renderWithI18n } from "../fixtures/renderWithI18n";
import CardDetailSheet from "../../src/components/CardDetailSheet";
import { LEGENDARY_MINION, MINION, SPELL, WEAPON, makeCardWithId } from "../fixtures/cards";
import { CardWithId } from "../../types/heartstone-api/type";

const LOADED_CARDS = [MINION, SPELL, LEGENDARY_MINION, WEAPON];

async function openSheet(card: CardWithId, cards: CardWithId[] = LOADED_CARDS) {
  const onClose = jest.fn();
  const onSelectCard = jest.fn();
  await renderWithI18n(<CardDetailSheet card={card} cards={cards} onClose={onClose} onSelectCard={onSelectCard} />);
  return { onClose, onSelectCard };
}

describe("CardDetailSheet", () => {
  it("shows the card, its stats and its text under translated labels", async () => {
    await openSheet(MINION);

    expect(screen.getByTestId("card-detail-sheet")).toBeTruthy();
    expect(screen.getByText("Chillwind Yeti")).toBeTruthy();
    expect(screen.getByText("Minion • Common")).toBeTruthy();
    expect(screen.getByText("Mana")).toBeTruthy();
    expect(screen.getByText("Attack")).toBeTruthy();
    expect(screen.getByText("Health")).toBeTruthy();
    expect(screen.getByText("Card text")).toBeTruthy();
    expect(screen.getByText("Deal 6 damage.")).toBeTruthy();
    expect(screen.getByText("Flavour")).toBeTruthy();
    expect(screen.getByText("Artist: Test Artist")).toBeTruthy();
  });

  it("leaves out attack and health for a spell, which has neither", async () => {
    await openSheet(SPELL);

    expect(screen.getByText("Fireball")).toBeTruthy();
    expect(screen.getByText("Mana")).toBeTruthy();
    expect(screen.queryByText("Attack")).toBeNull();
    expect(screen.queryByText("Health")).toBeNull();
  });

  it("shows the set only when the API sends one", async () => {
    const withSet = makeCardWithId({ slug: "yeti", name: "Chillwind Yeti", cardSetSlug: "legacy" }, "9");
    await openSheet(withSet, [withSet]);

    expect(screen.getByText("Set: legacy")).toBeTruthy();
  });

  it("closes when the close button is pressed", async () => {
    const { onClose } = await openSheet(MINION);

    fireEvent.press(screen.getByTestId("card-detail-close"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("lists the other cards of the same type and opens the one tapped", async () => {
    const { onSelectCard } = await openSheet(MINION);

    expect(screen.getByText("Ragnaros the Firelord")).toBeTruthy();
    expect(screen.queryByTestId("related-card-fireball")).toBeNull();
    expect(screen.queryByTestId("related-card-chillwind-yeti")).toBeNull();

    fireEvent.press(screen.getByTestId("related-card-ragnaros"));

    expect(onSelectCard).toHaveBeenCalledWith(LEGENDARY_MINION);
  });

  it("says so when no other card of the type is loaded yet", async () => {
    await openSheet(WEAPON, [WEAPON]);

    expect(screen.getByText("No other Weapon cards loaded yet.")).toBeTruthy();
    expect(screen.queryByTestId("related-cards-list")).toBeNull();
  });
});
