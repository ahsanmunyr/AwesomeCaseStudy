import en from "./locales/en.json";

/**
 * Tells i18next which keys our app has, so that t("app.titel") is a compile
 * error instead of an empty string shown to the user.
 */
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof en;
    };
    keySeparator: false;
  }
}
