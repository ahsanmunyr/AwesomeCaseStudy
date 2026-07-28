import React from "react";
import { fireEvent, screen } from "@testing-library/react-native";
import { renderWithI18n } from "../fixtures/renderWithI18n";
import FilterDropdown from "../../src/components/FilterDropdown";

const TYPES = [
  { slug: "minion", name: "Minion" },
  { slug: "spell", name: "Spell" },
];

describe("FilterDropdown", () => {
  it("shows the translated label when nothing is selected", async () => {
    await renderWithI18n(
      <FilterDropdown
        labelTx="filters.type"
        namespace="cardTypes"
        options={TYPES}
        value={null}
        onChange={jest.fn()}
        testID="filter-type"
      />,
    );
    expect(screen.getByText("Type")).toBeTruthy();
  });

  it("shows the selected option name instead of the label", async () => {
    await renderWithI18n(
      <FilterDropdown
        labelTx="filters.type"
        namespace="cardTypes"
        options={TYPES}
        value="spell"
        onChange={jest.fn()}
        testID="filter-type"
      />,
    );
    expect(screen.getByText("Spell")).toBeTruthy();
  });

  it("opens the sheet and lists every option", async () => {
    await renderWithI18n(
      <FilterDropdown
        labelTx="filters.type"
        namespace="cardTypes"
        options={TYPES}
        value={null}
        onChange={jest.fn()}
        testID="filter-type"
      />,
    );

    await fireEvent.press(screen.getByTestId("filter-type"));

    expect(screen.getByTestId("option-minion")).toBeTruthy();
    expect(screen.getByTestId("option-spell")).toBeTruthy();
  });

  it("emits the chosen slug", async () => {
    const onChange = jest.fn();
    await renderWithI18n(
      <FilterDropdown labelTx="filters.type" namespace="cardTypes" options={TYPES} value={null} onChange={onChange} testID="filter-type" />,
    );

    await fireEvent.press(screen.getByTestId("filter-type"));
    await fireEvent.press(screen.getByTestId("option-minion"));

    expect(onChange).toHaveBeenCalledWith("minion");
  });

  it("emits null when the 'all' entry is chosen", async () => {
    const onChange = jest.fn();
    await renderWithI18n(
      <FilterDropdown
        labelTx="filters.type"
        namespace="cardTypes"
        options={TYPES}
        value="minion"
        onChange={onChange}
        testID="filter-type"
      />,
    );

    await fireEvent.press(screen.getByTestId("filter-type"));
    await fireEvent.press(screen.getByTestId("option-__all__"));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("tells the user when no options have loaded yet", async () => {
    await renderWithI18n(
      <FilterDropdown labelTx="filters.type" namespace="cardTypes" options={[]} value={null} onChange={jest.fn()} testID="filter-type" />,
    );

    await fireEvent.press(screen.getByTestId("filter-type"));

    expect(screen.getByText(/No options loaded yet/)).toBeTruthy();
  });

  it("renders Arabic labels and option names when the language is ar", async () => {
    await renderWithI18n(
      <FilterDropdown
        labelTx="filters.type"
        namespace="cardTypes"
        options={TYPES}
        value={null}
        onChange={jest.fn()}
        testID="filter-type"
      />,
      "ar",
    );

    expect(screen.getByText("النوع")).toBeTruthy();

    await fireEvent.press(screen.getByTestId("filter-type"));

    expect(screen.getByText("تابع")).toBeTruthy();
    expect(screen.getByText("تعويذة")).toBeTruthy();
  });

  it("falls back to the API name for a slug with no translation", async () => {
    await renderWithI18n(
      <FilterDropdown
        labelTx="filters.type"
        namespace="cardTypes"
        options={[{ slug: "brand-new-type", name: "Brand New Type" }]}
        value={null}
        onChange={jest.fn()}
        testID="filter-type"
      />,
      "ar",
    );

    await fireEvent.press(screen.getByTestId("filter-type"));

    expect(screen.getByText("Brand New Type")).toBeTruthy();
  });
});
