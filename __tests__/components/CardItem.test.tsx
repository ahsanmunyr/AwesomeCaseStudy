import React from "react";
import { screen } from "@testing-library/react-native";
import { renderWithI18n } from "../fixtures/renderWithI18n";
import CardItem from "../../src/components/CardItem";
import { LEGENDARY_MINION, MINION, SPELL, makeCard } from "../fixtures/cards";

describe("CardItem", () => {
  it("renders the card name, type, class and rarity", async () => {
    await renderWithI18n(<CardItem card={LEGENDARY_MINION} />);

    expect(screen.getByText("Ragnaros the Firelord")).toBeTruthy();
    expect(screen.getByText("Minion")).toBeTruthy();
    expect(screen.getByText("Neutral")).toBeTruthy();
    expect(screen.getByText("Legendary")).toBeTruthy();
  });

  it("renders the mana cost", async () => {
    await renderWithI18n(<CardItem card={SPELL} />);
    expect(screen.getByText("4")).toBeTruthy();
  });

  it("renders attack and health for minions", async () => {
    await renderWithI18n(<CardItem card={MINION} />);
    expect(screen.getByText("4 ATK / 5 HP")).toBeTruthy();
  });

  it("omits the stat line for cards without attack and health", async () => {
    await renderWithI18n(<CardItem card={SPELL} />);
    expect(screen.queryByText(/ATK/)).toBeNull();
  });

  it("exposes a stable testID derived from the slug", async () => {
    await renderWithI18n(<CardItem card={SPELL} />);
    expect(screen.getByTestId("card-fireball")).toBeTruthy();
  });

  it("falls back gracefully when nested fields are missing", async () => {
    const broken = { ...makeCard({ slug: "broken", name: "Broken" }) } as any;
    delete broken.type;
    delete broken.class;
    delete broken.rarity;

    await renderWithI18n(<CardItem card={broken} />);

    expect(screen.getByText("Broken")).toBeTruthy();
    expect(screen.getByText("Unknown")).toBeTruthy();
    expect(screen.getByText("Neutral")).toBeTruthy();
  });
});
