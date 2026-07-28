import React from "react";
import { fireEvent, screen } from "@testing-library/react-native";
import { renderWithI18n } from "../fixtures/renderWithI18n";
import FilterDropdown from "../../src/components/FilterDropdown";

const TYPE_OPTIONS = [
  { slug: "minion", name: "Minion" },
  { slug: "spell", name: "Spell" },
];

/** Renders the Type dropdown with the options above. */
async function renderDropdown(value: string | null, onChange = jest.fn(), language: "en" | "ar" = "en") {
  await renderWithI18n(
    <FilterDropdown testID="filter-type" label="Type" namespace="cardTypes" options={TYPE_OPTIONS} value={value} onChange={onChange} />,
    language,
  );
  return onChange;
}

describe("FilterDropdown", () => {
  it("shows the filter name while nothing is chosen", async () => {
    await renderDropdown(null);

    expect(screen.getByText("Type")).toBeTruthy();
  });

  it("shows the chosen option instead of the filter name", async () => {
    await renderDropdown("spell");

    expect(screen.getByText("Spell")).toBeTruthy();
  });

  it("opens the sheet with every option plus an All row", async () => {
    await renderDropdown(null);

    await fireEvent.press(screen.getByTestId("filter-type"));

    expect(screen.getByTestId("option-minion")).toBeTruthy();
    expect(screen.getByTestId("option-spell")).toBeTruthy();
    expect(screen.getByText("All Type")).toBeTruthy();
  });

  it("reports the slug that was picked", async () => {
    const onChange = await renderDropdown(null);

    await fireEvent.press(screen.getByTestId("filter-type"));
    await fireEvent.press(screen.getByTestId("option-minion"));

    expect(onChange).toHaveBeenCalledWith("minion");
  });

  it("reports null when All is picked, meaning no filter", async () => {
    const onChange = await renderDropdown("minion");

    await fireEvent.press(screen.getByTestId("filter-type"));
    await fireEvent.press(screen.getByTestId("option-__all__"));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("closes the sheet after a choice", async () => {
    await renderDropdown(null);

    await fireEvent.press(screen.getByTestId("filter-type"));
    await fireEvent.press(screen.getByTestId("option-spell"));

    expect(screen.queryByTestId("option-spell")).toBeNull();
  });

  it("shows the option names in Arabic", async () => {
    await renderDropdown(null, jest.fn(), "ar");

    await fireEvent.press(screen.getByTestId("filter-type"));

    expect(screen.getByText("تابع")).toBeTruthy();
    expect(screen.getByText("تعويذة")).toBeTruthy();
  });

  it("says so when no option has been loaded yet", async () => {
    await renderWithI18n(
      <FilterDropdown testID="filter-type" label="Type" namespace="cardTypes" options={[]} value={null} onChange={jest.fn()} />,
    );

    await fireEvent.press(screen.getByTestId("filter-type"));

    expect(screen.getByText("No options loaded yet. Load more cards to see them.")).toBeTruthy();
  });
});
