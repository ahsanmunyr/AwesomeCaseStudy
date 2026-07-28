import axios, { AxiosInstance } from "axios";
import { createAjaxInstance } from "../config/api";
import APIS from "../config/baseURLs";
import { ApiError } from "./apiError";
import { HearthstoneResponse } from "../../types/heartstone-api/type";

export const DEFAULT_PAGE_SIZE = 12; // that value should be coming from the cms or server, we can handle it when App live

export interface GetCardsParams {
  page: number;
  pageSize?: number;
  signal?: AbortSignal;
}

let ajax: AxiosInstance | null = null;

function client(): AxiosInstance {
  if (!ajax) {
    ajax = createAjaxInstance();
  }
  return ajax;
}

function toRequestError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 429) {
      return new ApiError({ key: "errors.rateLimit" });
    }
    if (status === 401 || status === 403) {
      return new ApiError({ key: "errors.invalidKey" });
    }
    if (status) {
      return new ApiError({ key: "errors.http", params: { status } });
    }
    return new ApiError({ key: "errors.network" });
  }
  return new ApiError({ key: "errors.unknown" });
}

export async function getCards({ page, pageSize = DEFAULT_PAGE_SIZE, signal }: GetCardsParams): Promise<HearthstoneResponse> {
  try {
    const { data } = await client().get<HearthstoneResponse>(APIS.CARDS, {
      params: { page, pageSize },
      signal,
    });
    console.log(data, "------------------");
    return data;
  } catch (error) {
    throw toRequestError(error);
  }
}

export default { getCards };
