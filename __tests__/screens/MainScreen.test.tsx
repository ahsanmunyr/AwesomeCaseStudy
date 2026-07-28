import React from "react";
import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import { renderWithI18n } from "../fixtures/renderWithI18n";

jest.mock("../../src/services/cards.service", () => ({
  __esModule: true,
  DEFAULT_PAGE_SIZE: 12,
  getCards: jest.fn(),
}));

import { getCards } from "../../src/services/cards.service";
import MainScreen from "../../src/screens/MainScreen/MainScreen";
import { LEGENDARY_MINION, MINION, SPELL, WEAPON, makeResponse } from "../fixtures/cards";
import { ApiError } from "../../src/services/apiError";

const mockedGetCards = getCards as jest.MockedFunction<typeof getCards>;

const PAGE_ONE = [MINION, SPELL, LEGENDARY_MINION];

beforeEach(() => {
  mockedGetCards.mockReset();
});

/** Renders the screen and waits until the first page is on screen. */
async function renderScreen() {
  await renderWithI18n(<MainScreen />);
  await waitFor(() => expect(screen.getByText("Fireball")).toBeTruthy());
}

describe("MainScreen", () => {
  it("shows a spinner until the first page arrives", async () => {
    mockedGetCards.mockReturnValue(new Promise(() => {}));

    await renderWithI18n(<MainScreen />);

    expect(screen.getByTestId("loading-state")).toBeTruthy();
  });

  it("shows the cards of the first page", async () => {
    mockedGetCards.mockResolvedValue(makeResponse(PAGE_ONE));

    await renderScreen();

    expect(screen.getByText("Chillwind Yeti")).toBeTruthy();
    expect(screen.getByText("Ragnaros the Firelord")).toBeTruthy();
    expect(mockedGetCards).toHaveBeenCalledWith(1, 12);
  });

  it("narrows the list while the user types", async () => {
    mockedGetCards.mockResolvedValue(makeResponse(PAGE_ONE));
    await renderScreen();

    await fireEvent.changeText(screen.getByTestId("search-input"), "yeti");

    await waitFor(() => expect(screen.queryByText("Fireball")).toBeNull());
    expect(screen.getByText("Chillwind Yeti")).toBeTruthy();
  });

  it("shows only the cards of the type picked in the dropdown", async () => {
    mockedGetCards.mockResolvedValue(makeResponse(PAGE_ONE));
    await renderScreen();

    await fireEvent.press(screen.getByTestId("filter-type"));
    await fireEvent.press(screen.getByTestId("option-minion"));

    await waitFor(() => expect(screen.queryByText("Fireball")).toBeNull());
    expect(screen.getByText("Chillwind Yeti")).toBeTruthy();
  });

  it("brings every card back when Clear is pressed", async () => {
    mockedGetCards.mockResolvedValue(makeResponse(PAGE_ONE));
    await renderScreen();

    await fireEvent.press(screen.getByTestId("filter-type"));
    await fireEvent.press(screen.getByTestId("option-minion"));
    await waitFor(() => expect(screen.queryByText("Fireball")).toBeNull());

    await fireEvent.press(screen.getByTestId("clear-filters"));

    await waitFor(() => expect(screen.getByText("Fireball")).toBeTruthy());
  });

  it("loads the next page when Load more is pressed", async () => {
    mockedGetCards.mockResolvedValueOnce(makeResponse(PAGE_ONE)).mockResolvedValueOnce(makeResponse([WEAPON]));
    await renderScreen();

    await fireEvent.press(screen.getByTestId("load-more"));

    await waitFor(() => expect(screen.getByText("Fiery War Axe")).toBeTruthy());
    expect(mockedGetCards).toHaveBeenLastCalledWith(2, 12);
  });

  it("shows an error with a Try again button, and recovers", async () => {
    mockedGetCards.mockRejectedValueOnce(new ApiError({ key: "errors.network" }));

    await renderWithI18n(<MainScreen />);
    await waitFor(() => expect(screen.getByTestId("error-state")).toBeTruthy());
    expect(screen.getByText("Network error. Check your connection and try again.")).toBeTruthy();

    mockedGetCards.mockResolvedValueOnce(makeResponse(PAGE_ONE));
    await fireEvent.press(screen.getByTestId("retry-button"));

    await waitFor(() => expect(screen.getByText("Fireball")).toBeTruthy());
  });

  it("does not load page 2 until the user has actually dragged the list", async () => {
    mockedGetCards.mockResolvedValue(makeResponse(PAGE_ONE));
    await renderScreen();

    const list = screen.getByTestId("cards-list");

    // FlashList fires this once while it measures itself, before any scrolling.
    await act(async () => {
      list.props.onEndReached();
    });
    expect(mockedGetCards).toHaveBeenCalledTimes(1);

    // A slow drag must count. This is wired to onScrollBeginDrag, not
    // onMomentumScrollBegin, which only fires when the list is flicked.
    await act(async () => {
      list.props.onScrollBeginDrag();
      list.props.onEndReached();
    });

    await waitFor(() => expect(mockedGetCards).toHaveBeenCalledTimes(2));
    expect(mockedGetCards).toHaveBeenLastCalledWith(2, 12);
  });

  it("switches the whole screen to Arabic and back with the language button", async () => {
    mockedGetCards.mockResolvedValue(makeResponse(PAGE_ONE));
    await renderScreen();

    expect(screen.getByText("Hearthstone Cards")).toBeTruthy();
    // The button shows the language you will switch to.
    expect(screen.getByText("العربية")).toBeTruthy();

    await fireEvent.press(screen.getByTestId("language-toggle"));

    await waitFor(() => expect(screen.getByText("بطاقات هيرثستون")).toBeTruthy());
    expect(screen.queryByText("Hearthstone Cards")).toBeNull();
    expect(screen.getByText("English")).toBeTruthy();
    // Card names come from the API, so they stay as they are.
    expect(screen.getByText("Fireball")).toBeTruthy();

    await fireEvent.press(screen.getByTestId("language-toggle"));

    await waitFor(() => expect(screen.getByText("Hearthstone Cards")).toBeTruthy());
  });

  it("offers to load more when the search matches nothing loaded so far", async () => {
    mockedGetCards.mockResolvedValue(makeResponse(PAGE_ONE));
    await renderScreen();

    await fireEvent.changeText(screen.getByTestId("search-input"), "no such card");

    await waitFor(() => expect(screen.getByTestId("empty-state")).toBeTruthy());
    expect(screen.getByTestId("empty-load-more")).toBeTruthy();
    // The footer button must be hidden here, or the user sees two of them.
    expect(screen.queryByTestId("load-more")).toBeNull();
  });
});
