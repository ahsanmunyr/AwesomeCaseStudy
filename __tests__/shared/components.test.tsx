import React from "react";
import { StyleSheet, Text, TextStyle, ViewStyle } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { renderWithI18n } from "../fixtures/renderWithI18n";
import { CustomLoader, CustomPressable, CustomText, CustomTextInput, CustomView } from "../../src/shared/components";
import { useTranslation } from "../../src/shared/i18n";

/** Merges a possibly-nested RN style prop into one object. */
const flatten = (style: unknown): ViewStyle & TextStyle => StyleSheet.flatten(style as ViewStyle & TextStyle) ?? {};

describe("CustomText", () => {
  it("renders a translated key", async () => {
    await renderWithI18n(<CustomText tx="app.title" />);
    expect(screen.getByText("Hearthstone Cards")).toBeTruthy();
  });

  it("interpolates txParams", async () => {
    await renderWithI18n(<CustomText tx="list.progress" txParams={{ loaded: 12, total: 4305 }} />);
    expect(screen.getByText("12 of 4305 loaded")).toBeTruthy();
  });

  it("renders children for API-sourced values", async () => {
    await renderWithI18n(<CustomText>Ragnaros the Firelord</CustomText>);
    expect(screen.getByText("Ragnaros the Firelord")).toBeTruthy();
  });

  it("translates into Arabic when the provider language is ar", async () => {
    await renderWithI18n(<CustomText tx="app.title" />, "ar");
    expect(screen.getByText("بطاقات هيرثستون")).toBeTruthy();
  });

  it("marks text as rtl in Arabic and ltr in English", async () => {
    const { unmount } = await renderWithI18n(<CustomText testID="t" tx="app.title" />, "ar");
    expect(flatten(screen.getByTestId("t").props.style).writingDirection).toBe("rtl");
    await unmount();

    await renderWithI18n(<CustomText testID="t" tx="app.title" />);
    expect(flatten(screen.getByTestId("t").props.style).writingDirection).toBe("ltr");
  });

  it("applies the requested variant", async () => {
    await renderWithI18n(<CustomText testID="t" variant="title" tx="app.title" />);
    expect(flatten(screen.getByTestId("t").props.style).fontWeight).toBe("800");
  });

  it("lets an explicit color win", async () => {
    await renderWithI18n(
      <CustomText testID="t" variant="caption" color="#FF0000">
        x
      </CustomText>,
    );
    expect(flatten(screen.getByTestId("t").props.style).color).toBe("#FF0000");
  });
});

describe("CustomView", () => {
  it("renders children", async () => {
    await renderWithI18n(
      <CustomView>
        <Text>inside</Text>
      </CustomView>,
    );
    expect(screen.getByText("inside")).toBeTruthy();
  });

  it("applies the screen variant", async () => {
    await renderWithI18n(<CustomView testID="v" variant="screen" />);
    const style = flatten(screen.getByTestId("v").props.style);
    expect(style.flex).toBe(1);
    expect(style.backgroundColor).toBeDefined();
  });

  it("applies row, center and flex shorthands", async () => {
    await renderWithI18n(<CustomView testID="v" row center flex />);
    const style = flatten(screen.getByTestId("v").props.style);
    expect(style.flexDirection).toBe("row");
    expect(style.justifyContent).toBe("center");
    expect(style.flex).toBe(1);
  });
});

describe("CustomPressable", () => {
  it("renders a translated label from tx", async () => {
    await renderWithI18n(<CustomPressable tx="list.loadMore" onPress={jest.fn()} />);
    expect(screen.getByText("Load more")).toBeTruthy();
  });

  it("interpolates txParams in the label", async () => {
    await renderWithI18n(<CustomPressable tx="filters.clear" txParams={{ count: 2 }} onPress={jest.fn()} />);
    expect(screen.getByText("Clear (2)")).toBeTruthy();
  });

  it("sets a translated accessibility label", async () => {
    await renderWithI18n(<CustomPressable testID="p" accessibilityTx="filters.clearLabel" onPress={jest.fn()} />);
    expect(screen.getByTestId("p").props.accessibilityLabel).toBe("Clear all filters");
  });

  it("fires onPress", async () => {
    const onPress = jest.fn();
    await renderWithI18n(<CustomPressable testID="p" tx="list.retry" onPress={onPress} />);

    await fireEvent.press(screen.getByTestId("p"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders children when no tx is given", async () => {
    await renderWithI18n(
      <CustomPressable variant="plain" onPress={jest.fn()}>
        <Text>custom child</Text>
      </CustomPressable>,
    );
    expect(screen.getByText("custom child")).toBeTruthy();
  });

  it("defaults to the button accessibility role", async () => {
    await renderWithI18n(<CustomPressable testID="p" tx="list.retry" onPress={jest.fn()} />);
    expect(screen.getByTestId("p").props.accessibilityRole).toBe("button");
  });
});

describe("CustomLoader", () => {
  it("renders without a caption by default", async () => {
    await renderWithI18n(<CustomLoader testID="loader" />);
    expect(screen.getByTestId("loader")).toBeTruthy();
  });

  it("renders a translated caption when tx is given", async () => {
    await renderWithI18n(<CustomLoader testID="loader" tx="list.loading" />);
    expect(screen.getByText("Loading cards…")).toBeTruthy();
  });

  it("renders the Arabic caption in ar", async () => {
    await renderWithI18n(<CustomLoader tx="list.loading" />, "ar");
    expect(screen.getByText("جارٍ تحميل البطاقات…")).toBeTruthy();
  });
});

describe("CustomTextInput", () => {
  it("uses a translated placeholder", async () => {
    await renderWithI18n(<CustomTextInput testID="i" placeholderTx="search.placeholder" />);
    expect(screen.getByTestId("i").props.placeholder).toBe("Search cards by name");
  });

  it("uses a translated accessibility label", async () => {
    await renderWithI18n(<CustomTextInput testID="i" accessibilityTx="search.label" />);
    expect(screen.getByTestId("i").props.accessibilityLabel).toBe("Search cards by name");
  });

  it("uses the Arabic placeholder in ar", async () => {
    await renderWithI18n(<CustomTextInput testID="i" placeholderTx="search.placeholder" />, "ar");
    expect(screen.getByTestId("i").props.placeholder).toBe("ابحث عن البطاقات بالاسم");
  });

  it("right-aligns text in Arabic and left-aligns in English", async () => {
    const { unmount } = await renderWithI18n(<CustomTextInput testID="i" />, "ar");
    expect(flatten(screen.getByTestId("i").props.style).textAlign).toBe("right");
    await unmount();

    await renderWithI18n(<CustomTextInput testID="i" />);
    expect(flatten(screen.getByTestId("i").props.style).textAlign).toBe("left");
  });

  it("emits typed text", async () => {
    const onChangeText = jest.fn();
    await renderWithI18n(<CustomTextInput testID="i" onChangeText={onChangeText} />);

    await fireEvent.changeText(screen.getByTestId("i"), "yeti");

    expect(onChangeText).toHaveBeenCalledWith("yeti");
  });
});

describe("useTranslation", () => {
  it("throws a helpful error when used outside the provider", async () => {
    const Orphan = () => {
      useTranslation();
      return null;
    };
    // React logs the thrown error; silence it for this expected failure.
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(render(<Orphan />)).rejects.toThrow(/must be used inside an I18nProvider/);

    spy.mockRestore();
  });
});
