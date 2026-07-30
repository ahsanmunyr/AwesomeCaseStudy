import { AxiosError } from "axios";
import { makeCard, makeRawResponse } from "../fixtures/cards";

const mockGet = jest.fn();

jest.mock("axios", () => {
  const actual = jest.requireActual("axios");
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => ({ get: mockGet })),
      isAxiosError: actual.isAxiosError,
    },
    isAxiosError: actual.isAxiosError,
  };
});

import axios from "axios";
import { DEFAULT_PAGE_SIZE, getCards } from "../../src/services/cards.service";
import { ApiError } from "../../src/services/apiError";

const RAW_SPELL = makeCard({ slug: "fireball", name: "Fireball" });
function httpError(status: number): AxiosError {
  const error = new Error("Request failed") as AxiosError;
  error.isAxiosError = true;
  error.toJSON = () => ({});
  // @ts-expect-error a status is all the code under test reads
  error.response = { status };
  return error;
}

async function errorInfoFrom(): Promise<ApiError["info"]> {
  try {
    await getCards(1);
  } catch (error) {
    return (error as ApiError).info;
  }
  throw new Error("expected getCards to fail");
}

beforeEach(() => {
  mockGet.mockReset();
});

describe("getCards", () => {
  it("asks RapidAPI for the given page, 12 cards at a time, with the API key attached", async () => {
    mockGet.mockResolvedValue({ data: makeRawResponse([RAW_SPELL]) });

    await getCards(3);

    expect(DEFAULT_PAGE_SIZE).toBe(12);
    expect(mockGet).toHaveBeenCalledWith("/cards", { params: { page: 3, pageSize: 12 } });
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: "https://hearthstone11.p.rapidapi.com",
        headers: expect.objectContaining({ "x-rapidapi-key": "test-api-key" }),
      }),
    );
  });

  it("gives every card an id from its position in the whole list, because the API sends none", async () => {
    mockGet.mockResolvedValue({ data: makeRawResponse([RAW_SPELL, makeCard({ slug: "yeti", name: "Chillwind Yeti" })]) });

    const secondPage = await getCards(2);

    expect(RAW_SPELL).not.toHaveProperty("id");
    expect(secondPage.cards.map(card => card.id)).toEqual(["12", "13"]);
    expect(secondPage.cardCount).toBe(4305);
    expect(secondPage.pageCount).toBe(359);
  });

  it("turns the HTTP statuses the app can hit into their own messages", async () => {
    mockGet.mockRejectedValue(httpError(429));
    await expect(errorInfoFrom()).resolves.toEqual({ key: "errors.rateLimit" });

    mockGet.mockRejectedValue(httpError(401));
    await expect(errorInfoFrom()).resolves.toEqual({ key: "errors.invalidKey" });

    mockGet.mockRejectedValue(httpError(500));
    await expect(errorInfoFrom()).resolves.toEqual({ key: "errors.http", params: { status: 500 } });
  });

  it("turns a request that never arrives into the network message", async () => {
    const offline = new Error("Network Error") as AxiosError;
    offline.isAxiosError = true;
    offline.toJSON = () => ({});
    mockGet.mockRejectedValue(offline);

    await expect(errorInfoFrom()).resolves.toEqual({ key: "errors.network" });
  });
});
