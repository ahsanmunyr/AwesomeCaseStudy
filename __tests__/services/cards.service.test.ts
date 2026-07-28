import { AxiosError } from "axios";
import { makeCard, makeRawResponse } from "../fixtures/cards";

const mockGet = jest.fn();

// Replace axios so no real request leaves the test.
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
import { cardIdentity } from "../../src/services/cardIdentity";

/** A card exactly as the API sends it: no id yet. */
const RAW_SPELL = makeCard({ slug: "fireball", name: "Fireball" });

/** Builds the kind of error axios throws when the server answers with a status. */
function httpError(status: number): AxiosError {
  const error = new Error("Request failed") as AxiosError;
  error.isAxiosError = true;
  error.toJSON = () => ({});
  // @ts-expect-error a status is all the code under test reads
  error.response = { status };
  return error;
}

/** Builds the kind of error axios throws when the request never arrives. */
function networkError(): AxiosError {
  const error = new Error("Network Error") as AxiosError;
  error.isAxiosError = true;
  error.toJSON = () => ({});
  return error;
}

/** Calls getCards and returns the error info it throws. */
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

describe("the axios client", () => {
  it("is built with the RapidAPI address and key", async () => {
    mockGet.mockResolvedValue({ data: makeRawResponse([RAW_SPELL]) });
    await getCards(1);

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: "https://hearthstone11.p.rapidapi.com",
        headers: expect.objectContaining({
          "x-rapidapi-key": "test-api-key",
          "x-rapidapi-host": "hearthstone11.p.rapidapi.com",
        }),
      }),
    );
  });
});

describe("getCards", () => {
  it("asks for the given page, 12 cards at a time", async () => {
    mockGet.mockResolvedValue({ data: makeRawResponse([RAW_SPELL]) });

    await getCards(3);

    expect(DEFAULT_PAGE_SIZE).toBe(12);
    expect(mockGet).toHaveBeenCalledWith("/cards", { params: { page: 3, pageSize: 12 } });
  });

  it("accepts another page size", async () => {
    mockGet.mockResolvedValue({ data: makeRawResponse([RAW_SPELL]) });

    await getCards(1, 50);

    expect(mockGet).toHaveBeenCalledWith("/cards", { params: { page: 1, pageSize: 50 } });
  });

  it("returns the counts from the answer", async () => {
    mockGet.mockResolvedValue({ data: makeRawResponse([RAW_SPELL], { cardCount: 4305, pageCount: 359 }) });

    const page = await getCards(1);

    expect(page.cardCount).toBe(4305);
    expect(page.pageCount).toBe(359);
  });

  it("gives every card an id, because the API sends none", async () => {
    mockGet.mockResolvedValue({ data: makeRawResponse([RAW_SPELL]) });

    const page = await getCards(1);

    expect(RAW_SPELL).not.toHaveProperty("id");
    expect(page.cards[0].id).toBe(cardIdentity(RAW_SPELL));
    expect(page.cards[0].name).toBe("Fireball");
  });

  it("copes with an answer that has no cards array", async () => {
    mockGet.mockResolvedValue({ data: { cardCount: 0, pageCount: 0, page: "1" } });

    await expect(getCards(1)).resolves.toMatchObject({ cards: [] });
  });

  it("turns 429 into the rate-limit message", async () => {
    mockGet.mockRejectedValue(httpError(429));

    await expect(errorInfoFrom()).resolves.toEqual({ key: "errors.rateLimit" });
  });

  it("turns 401 and 403 into the invalid-key message", async () => {
    mockGet.mockRejectedValue(httpError(401));
    await expect(errorInfoFrom()).resolves.toEqual({ key: "errors.invalidKey" });

    mockGet.mockRejectedValue(httpError(403));
    await expect(errorInfoFrom()).resolves.toEqual({ key: "errors.invalidKey" });
  });

  it("keeps the status number for any other HTTP error", async () => {
    mockGet.mockRejectedValue(httpError(500));

    await expect(errorInfoFrom()).resolves.toEqual({ key: "errors.http", params: { status: 500 } });
  });

  it("turns a failed connection into the network message", async () => {
    mockGet.mockRejectedValue(networkError());

    await expect(errorInfoFrom()).resolves.toEqual({ key: "errors.network" });
  });

  it("turns anything else into the unknown message", async () => {
    mockGet.mockRejectedValue(new Error("boom"));

    await expect(errorInfoFrom()).resolves.toEqual({ key: "errors.unknown" });
  });
});
