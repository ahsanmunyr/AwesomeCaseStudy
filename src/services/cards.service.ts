import axios, { AxiosInstance } from "axios";
import { createApiClient } from "../config/api";
import API from "../config/baseURLs";
import { ApiError } from "./apiError";
import { CardsPage, HearthstoneResponse } from "../../types/heartstone-api/type";
import { withCardIds } from "./cardIdentity";

export const DEFAULT_PAGE_SIZE = 12;

let client: AxiosInstance | null = null;

function getClient(): AxiosInstance {
  if (!client) {
    client = createApiClient();
  }
  return client;
}

function toApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return new ApiError({ key: "errors.unknown" });
  }

  // these errors are all handled in the same way, so we don't need to distinguish between them, we can handle these messages from any cms side
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

export async function getCards(page: number, pageSize: number = DEFAULT_PAGE_SIZE): Promise<CardsPage> {
  try {
    const response = await getClient().get<HearthstoneResponse>(API.CARDS, {
      params: { page, pageSize },
    });

    return { ...response.data, cards: withCardIds(response.data.cards ?? []) };
  } catch (error) {
    throw toApiError(error);
  }
}
