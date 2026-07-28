import React from "react";
import { screen } from "@testing-library/react-native";
import { renderWithI18n } from "../fixtures/renderWithI18n";
import CardItem from "../../src/components/CardItem";
import { MINION, SPELL } from "../fixtures/cards";

describe("CardItem", () => {
  it("shows the name, the mana cost and the card details", async () => {
    await renderWithI18n(<CardItem card={MINION} />);

    expect(screen.getByText("Chillwind Yeti")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
    expect(screen.getByText("Minion")).toBeTruthy();
    expect(screen.getByText("Neutral")).toBeTruthy();
    expect(screen.getByText("Common")).toBeTruthy();
  });

  it("shows attack and health for a minion", async () => {
    await renderWithI18n(<CardItem card={MINION} />);

    expect(screen.getByText("4 ATK / 5 HP")).toBeTruthy();
  });

  it("shows no attack or health for a spell, which has neither", async () => {
    await renderWithI18n(<CardItem card={SPELL} />);

    expect(screen.getByText("Fireball")).toBeTruthy();
    expect(screen.queryByText(/ATK/)).toBeNull();
  });

  it("translates the card details into Arabic, keeping the card name as it is", async () => {
    await renderWithI18n(<CardItem card={MINION} />, "ar");

    expect(screen.getByText("Chillwind Yeti")).toBeTruthy();
    expect(screen.getByText("تابع")).toBeTruthy();
  });
});
