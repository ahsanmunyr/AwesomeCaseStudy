/* eslint-env jest */

// react-native-config reads from native code, which does not exist under Jest.
jest.mock("react-native-config", () => ({
  __esModule: true,
  default: { RAPID_API_KEY: "test-api-key" },
}));

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaProvider: ({ children }) => React.createElement(View, null, children),
    SafeAreaView: ({ children, style }) => React.createElement(View, { style }, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// FlashList virtualises off-screen rows, which hides them from queries. The
// stub renders every row so assertions can see the real list contents.
jest.mock("@shopify/flash-list", () => {
  const React = require("react");
  const { View } = require("react-native");

  const FlashList = ({
    data = [],
    renderItem,
    keyExtractor,
    ListEmptyComponent,
    ListFooterComponent,
    testID,
    onEndReached,
    onScrollBeginDrag,
  }) => {
    const renderNode = node => (typeof node === "function" ? React.createElement(node) : node ?? null);

    // The scroll callbacks are put on the stub so a test can fire them and
    // check how the screen wired them up.
    return React.createElement(
      View,
      { testID, onEndReached, onScrollBeginDrag },
      data.length === 0
        ? renderNode(ListEmptyComponent)
        : data.map((item, index) =>
            React.createElement(React.Fragment, { key: keyExtractor ? keyExtractor(item, index) : index }, renderItem({ item, index })),
          ),
      renderNode(ListFooterComponent),
    );
  };

  return { FlashList, __esModule: true };
});
