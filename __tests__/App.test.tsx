/**
 * @format
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";

jest.mock("../src/services/cards.service", () => ({
  __esModule: true,
  DEFAULT_PAGE_SIZE: 12,
  getCards: jest.fn(),
}));

import { getCards } from "../src/services/cards.service";
import App from "../App";
import { SPELL, makeResponse } from "./fixtures/cards";

const mockedGetCards = getCards as jest.MockedFunction<typeof getCards>;

it("renders the card browser", async () => {
  mockedGetCards.mockResolvedValue(makeResponse([SPELL]));

  await render(<App />);

  await waitFor(() => expect(screen.getByText("Hearthstone Cards")).toBeTruthy());
  expect(screen.getByText("Fireball")).toBeTruthy();
});
