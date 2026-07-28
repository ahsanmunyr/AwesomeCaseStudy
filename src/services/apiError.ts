import { TranslationKey, TranslationParams } from "../shared/i18n";

export interface ApiErrorInfo {
  key: TranslationKey;
  params?: TranslationParams;
}

export class ApiError extends Error {
  readonly info: ApiErrorInfo;

  constructor(info: ApiErrorInfo) {
    super(info.key);
    this.name = "ApiError";
    this.info = info;
  }
}

export function toApiErrorInfo(error: unknown): ApiErrorInfo {
  if (error instanceof ApiError) {
    return error.info;
  }
  return { key: "errors.unknown" };
}
