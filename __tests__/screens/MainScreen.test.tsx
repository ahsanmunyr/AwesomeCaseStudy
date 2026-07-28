import React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
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

describe("MainScreen", () => {
  it("shows a loading state before the first page arrives", async () => {
    mockedGetCards.mockReturnValue(new Promise(() => {}));

    await renderWithI18n(<MainScreen />);

    expect(screen.getByTestId("loading-state")).toBeTruthy();
  });

  it("renders the cards returned by the All Cards service", async () => {
    mockedGetCards.mockResolvedValue(makeResponse(PAGE_ONE));

    await renderWithI18n(<MainScreen />);

    await waitFor(() => expect(screen.getByText("Chillwind Yeti")).toBeTruthy());
    expect(screen.getByText("Fireball")).toBeTruthy();
    expect(screen.getByText("Ragnaros the Firelord")).toBeTruthy();
  });

  it("requests 12 cards per page", async () => {
    mockedGetCards.mockResolvedValue(makeResponse(PAGE_ONE));

    await renderWithI18n(<MainScreen />);

    await waitFor(() => expect(mockedGetCards).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 12 })));
  });

  it("filters the list as the user searches", async () => {
    mockedGetCards.mockResolvedValue(makeResponse(PAGE_ONE));
    await renderWithI18n(<MainScreen />);
    await waitFor(() => expect(screen.getByText("Fireball")).toBeTruthy());

    await fireEvent.changeText(screen.getByTestId("search-input"), "yeti");

    await waitFor(() => expect(screen.queryByText("Fireball")).toBeNull());
    expect(screen.getByText("Chillwind Yeti")).toBeTruthy();
  });

  it("lists the unique card types loaded so far in the Type dropdown", async () => {
    mockedGetCards.mockResolvedValue(makeResponse(PAGE_ONE));
    await renderWithI18n(<MainScreen />);
    await waitFor(() => expect(screen.getByText("Fireball")).toBeTruthy());

    await fireEvent.press(screen.getByTestId("filter-type"));

    // PAGE_ONE contains two minions and one spell -> two unique types.
    expect(screen.getByTestId("option-minion")).toBeTruthy();
    expect(screen.getByTestId("option-spell")).toBeTruthy();
    expect(screen.queryByTestId("option-weapon")).toBeNull();
  });

  it("shows only the cards of the selected type", async () => {
    mockedGetCards.mockResolvedValue(makeResponse(PAGE_ONE));
    await renderWithI18n(<MainScreen />);
    await waitFor(() => expect(screen.getByText("Fireball")).toBeTruthy());

    await fireEvent.press(screen.getByTestId("filter-type"));
    await fireEvent.press(screen.getByTestId("option-minion"));

    await waitFor(() => expect(screen.queryByText("Fireball")).toBeNull());
    expect(screen.getByText("Chillwind Yeti")).toBeTruthy();
    expect(screen.getByText("Ragnaros the Firelord")).toBeTruthy();
  });

  it("clears all filters when Clear is pressed", async () => {
    mockedGetCards.mockResolvedValue(makeResponse(PAGE_ONE));
    await renderWithI18n(<MainScreen />);
    await waitFor(() => expect(screen.getByText("Fireball")).toBeTruthy());

    await fireEvent.press(screen.getByTestId("filter-type"));
    await fireEvent.press(screen.getByTestId("option-minion"));
    await waitFor(() => expect(screen.queryByText("Fireball")).toBeNull());

    await fireEvent.press(screen.getByTestId("clear-filters"));

    await waitFor(() => expect(screen.getByText("Fireball")).toBeTruthy());
  });

  it("loads the next page when Load more is pressed", async () => {
    mockedGetCards.mockResolvedValueOnce(makeResponse(PAGE_ONE)).mockResolvedValueOnce(makeResponse([WEAPON], { page: "2" }));

    await renderWithI18n(<MainScreen />);
    await waitFor(() => expect(screen.getByText("Fireball")).toBeTruthy());

    await fireEvent.press(screen.getByTestId("load-more"));

    await waitFor(() => expect(screen.getByText("Fiery War Axe")).toBeTruthy());
    expect(mockedGetCards).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
  });

  it("surfaces an error with a retry when the first page fails", async () => {
    mockedGetCards.mockRejectedValueOnce(new ApiError({ key: "errors.network" }));

    await renderWithI18n(<MainScreen />);

    await waitFor(() => expect(screen.getByTestId("error-state")).toBeTruthy());
    expect(screen.getByText("Network error. Check your connection and try again.")).toBeTruthy();

    mockedGetCards.mockResolvedValueOnce(makeResponse(PAGE_ONE));
    await fireEvent.press(screen.getByTestId("retry-button"));

    await waitFor(() => expect(screen.getByText("Fireball")).toBeTruthy());
  });

  it("offers to load more when a filter matches nothing loaded yet", async () => {
    mockedGetCards.mockResolvedValue(makeResponse(PAGE_ONE));
    await renderWithI18n(<MainScreen />);
    await waitFor(() => expect(screen.getByText("Fireball")).toBeTruthy());

    await fireEvent.changeText(screen.getByTestId("search-input"), "nonexistent card");

    await waitFor(() => expect(screen.getByTestId("empty-state")).toBeTruthy());
    expect(screen.getByTestId("empty-load-more")).toBeTruthy();
  });

  it("shows exactly one load-more control when the list is empty", async () => {
    mockedGetCards.mockResolvedValue(makeResponse(PAGE_ONE));
    await renderWithI18n(<MainScreen />);
    await waitFor(() => expect(screen.getByText("Fireball")).toBeTruthy());

    await fireEvent.changeText(screen.getByTestId("search-input"), "nonexistent card");
    await waitFor(() => expect(screen.getByTestId("empty-state")).toBeTruthy());

    // FlashList renders the empty component and the footer together, so the
    // footer button must be suppressed or the user sees two identical buttons.
    expect(screen.queryByTestId("load-more")).toBeNull();
    // Exact match: the hint sentence also contains the words "Load more".
    expect(screen.queryAllByText("Load more")).toHaveLength(0);
    expect(screen.queryAllByText("Load more cards")).toHaveLength(1);
  });

  it("shows the footer load-more control when the list has cards", async () => {
    mockedGetCards.mockResolvedValue(makeResponse(PAGE_ONE));
    await renderWithI18n(<MainScreen />);
    await waitFor(() => expect(screen.getByText("Fireball")).toBeTruthy());

    expect(screen.getByTestId("load-more")).toBeTruthy();
    expect(screen.queryByTestId("empty-state")).toBeNull();
  });
});
