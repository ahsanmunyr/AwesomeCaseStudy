module.exports = {
  preset: "@react-native/jest-preset",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!(@react-native|react-native|@shopify/flash-list|react-native-safe-area-context|react-native-config)/)",
  ],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/theme/**", "!src/config/baseURLs.ts"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/__tests__/fixtures/"],
};
