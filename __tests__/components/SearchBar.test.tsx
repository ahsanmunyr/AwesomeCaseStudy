import React from "react";
import { fireEvent, screen } from "@testing-library/react-native";
import { renderWithI18n } from "../fixtures/renderWithI18n";
import SearchBar from "../../src/components/SearchBar";

describe("SearchBar", () => {
  it("shows the current value", async () => {
    await renderWithI18n(<SearchBar value="fire" onChange={jest.fn()} />);
    expect(screen.getByTestId("search-input").props.value).toBe("fire");
  });

  it("emits each keystroke to onChange", async () => {
    const onChange = jest.fn();
    await renderWithI18n(<SearchBar value="" onChange={onChange} />);

    await fireEvent.changeText(screen.getByTestId("search-input"), "fire");

    expect(onChange).toHaveBeenCalledWith("fire");
  });

  it("hides the clear button when empty", async () => {
    await renderWithI18n(<SearchBar value="" onChange={jest.fn()} />);
    expect(screen.queryByTestId("search-clear")).toBeNull();
  });

  it("clears the value when the clear button is pressed", async () => {
    const onChange = jest.fn();
    await renderWithI18n(<SearchBar value="fire" onChange={onChange} />);

    await fireEvent.press(screen.getByTestId("search-clear"));

    expect(onChange).toHaveBeenCalledWith("");
  });
});
