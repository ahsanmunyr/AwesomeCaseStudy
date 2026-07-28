import React from "react";
import { StyleSheet } from "react-native";
import { fireEvent, screen } from "@testing-library/react-native";
import { renderWithI18n } from "../fixtures/renderWithI18n";
import { CustomLoader, CustomPressable, CustomText, CustomTextInput, CustomView } from "../../src/shared/components";

/** Reads the final style of an element, after all the style arrays are merged. */
function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

describe("CustomText", () => {
  it("shows the text it is given", async () => {
    await renderWithI18n(<CustomText>Fireball</CustomText>);

    expect(screen.getByText("Fireball")).toBeTruthy();
  });

  it("uses the style of the chosen variant", async () => {
    await renderWithI18n(
      <CustomText testID="heading" variant="title">
        Hearthstone Cards
      </CustomText>,
    );

    expect(styleOf("heading").fontSize).toBe(22);
  });

  it("lets a single colour be overridden", async () => {
    await renderWithI18n(
      <CustomText testID="rare" color="#4A9BFF">
        Rare
      </CustomText>,
    );

    expect(styleOf("rare").color).toBe("#4A9BFF");
  });

  it("writes left to right in English", async () => {
    await renderWithI18n(<CustomText testID="line">Fireball</CustomText>, "en");

    expect(styleOf("line").writingDirection).toBe("ltr");
  });

  it("writes right to left in Arabic, and aligns to the right edge", async () => {
    await renderWithI18n(<CustomText testID="line">Fireball</CustomText>, "ar");

    expect(styleOf("line").writingDirection).toBe("rtl");
    expect(styleOf("line").textAlign).toBe("right");
  });

  it("lets a variant keep its own alignment in Arabic", async () => {
    await renderWithI18n(
      <CustomText testID="oops" variant="error">
        Something went wrong.
      </CustomText>,
      "ar",
    );

    expect(styleOf("oops").textAlign).toBe("center");
  });
});

describe("CustomView", () => {
  it("lays children out in a row when asked", async () => {
    await renderWithI18n(<CustomView testID="row" row />);

    expect(styleOf("row").flexDirection).toBe("row");
  });

  it("centres its children when asked", async () => {
    await renderWithI18n(<CustomView testID="middle" center />);

    expect(styleOf("middle").alignItems).toBe("center");
  });

  it("reverses the row in Arabic, so the layout mirrors without an app restart", async () => {
    await renderWithI18n(<CustomView testID="row" row />, "ar");

    expect(styleOf("row").flexDirection).toBe("row-reverse");
  });
});

describe("CustomPressable", () => {
  it("shows its label", async () => {
    await renderWithI18n(<CustomPressable label="Try again" onPress={jest.fn()} />);

    expect(screen.getByText("Try again")).toBeTruthy();
  });

  it("calls onPress when tapped", async () => {
    const onPress = jest.fn();
    await renderWithI18n(<CustomPressable testID="button" label="Load more" onPress={onPress} />);

    await fireEvent.press(screen.getByTestId("button"));

    expect(onPress).toHaveBeenCalled();
  });

  it("shows its children when no label is given", async () => {
    await renderWithI18n(
      <CustomPressable variant="plain" onPress={jest.fn()}>
        <CustomText>✕</CustomText>
      </CustomPressable>,
    );

    expect(screen.getByText("✕")).toBeTruthy();
  });

  it("mirrors a pill in Arabic, so the caret sits left of its label", async () => {
    await renderWithI18n(<CustomPressable testID="pill" variant="pill" label="Type" onPress={jest.fn()} />, "ar");

    expect(styleOf("pill").flexDirection).toBe("row-reverse");
  });

  it("does not mirror the plain variant, which is used for columns and backdrops", async () => {
    await renderWithI18n(
      <CustomPressable testID="backdrop" variant="plain" onPress={jest.fn()}>
        <CustomText>anything</CustomText>
      </CustomPressable>,
      "ar",
    );

    expect(styleOf("backdrop").flexDirection).toBeUndefined();
  });

  it("passes the accessibility label through", async () => {
    await renderWithI18n(<CustomPressable testID="clear" accessibilityLabel="Clear search" onPress={jest.fn()} />);

    expect(screen.getByTestId("clear").props.accessibilityLabel).toBe("Clear search");
  });
});

describe("CustomTextInput", () => {
  it("shows its placeholder", async () => {
    await renderWithI18n(<CustomTextInput testID="input" placeholder="Search cards by name" />);

    expect(screen.getByTestId("input").props.placeholder).toBe("Search cards by name");
  });

  it("aligns the text to the right in Arabic", async () => {
    await renderWithI18n(<CustomTextInput testID="input" />, "ar");

    expect(styleOf("input").textAlign).toBe("right");
  });
});

describe("CustomLoader", () => {
  it("shows its caption under the spinner", async () => {
    await renderWithI18n(<CustomLoader testID="loader" caption="Loading cards…" />);

    expect(screen.getByText("Loading cards…")).toBeTruthy();
  });

  it("works without a caption", async () => {
    await renderWithI18n(<CustomLoader testID="loader" />);

    expect(screen.getByTestId("loader")).toBeTruthy();
  });
});
