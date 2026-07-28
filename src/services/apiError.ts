import { TranslationKey, TranslationParams } from "../shared/i18n";

export type ApiErrorKey = Extract<TranslationKey, `errors.${string}`>;

export interface ApiErrorInfo {
  key: ApiErrorKey;
  params?: TranslationParams;
}

/**
 * Services describe failures with a translation key rather than a message, so
 * no user-facing English is created outside the locale files.
 */
export class ApiError extends Error {
  readonly info: ApiErrorInfo;

  constructor(info: ApiErrorInfo) {
    super(info.key);
    this.name = "ApiError";
    this.info = info;
  }
}

export function toApiErrorInfo(error: unknown): ApiErrorInfo {
  return error instanceof ApiError ? error.info : { key: "errors.unknown" };
}
