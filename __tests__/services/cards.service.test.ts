import { AxiosError } from "axios";
import { MINION, SPELL, makeResponse } from "../fixtures/cards";

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

function axiosErrorWithStatus(status: number): AxiosError {
  const error = new Error("Request failed") as AxiosError;
  error.isAxiosError = true;
  error.toJSON = () => ({});
  // @ts-expect-error partial response is enough for the code under test
  error.response = { status };
  return error;
}

function networkError(): AxiosError {
  const error = new Error("Network Error") as AxiosError;
  error.isAxiosError = true;
  error.toJSON = () => ({});
  return error;
}

beforeEach(() => {
  mockGet.mockReset();
});

describe("createAjaxInstance wiring", () => {
  it("configures the shared instance with RapidAPI credentials", async () => {
    mockGet.mockResolvedValue({ data: makeResponse([SPELL]) });

    await getCards({ page: 1 });

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
  it("requests the given page with the default page size of 12", async () => {
    mockGet.mockResolvedValue({ data: makeResponse([SPELL]) });

    await getCards({ page: 3 });

    expect(DEFAULT_PAGE_SIZE).toBe(12);
    expect(mockGet).toHaveBeenCalledWith("/cards", expect.objectContaining({ params: { page: 3, pageSize: 12 } }));
  });

  it("honours an explicit page size", async () => {
    mockGet.mockResolvedValue({ data: makeResponse([SPELL]) });

    await getCards({ page: 1, pageSize: 50 });

    expect(mockGet).toHaveBeenCalledWith("/cards", expect.objectContaining({ params: { page: 1, pageSize: 50 } }));
  });

  it("forwards the abort signal", async () => {
    mockGet.mockResolvedValue({ data: makeResponse([SPELL]) });
    const controller = new AbortController();

    await getCards({ page: 1, signal: controller.signal });

    expect(mockGet).toHaveBeenCalledWith("/cards", expect.objectContaining({ signal: controller.signal }));
  });

  it("returns the parsed response body", async () => {
    const response = makeResponse([SPELL, MINION]);
    mockGet.mockResolvedValue({ data: response });

    await expect(getCards({ page: 1 })).resolves.toEqual(response);
  });

  async function infoFor(page = 1) {
    try {
      await getCards({ page });
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      return (error as ApiError).info;
    }
    throw new Error("expected getCards to reject");
  }

  it("maps a 429 to the rate-limit key", async () => {
    mockGet.mockRejectedValue(axiosErrorWithStatus(429));

    await expect(infoFor()).resolves.toEqual({ key: "errors.rateLimit" });
  });

  it("maps 401 and 403 to the invalid-key key", async () => {
    mockGet.mockRejectedValue(axiosErrorWithStatus(401));
    await expect(infoFor()).resolves.toEqual({ key: "errors.invalidKey" });

    mockGet.mockRejectedValue(axiosErrorWithStatus(403));
    await expect(infoFor()).resolves.toEqual({ key: "errors.invalidKey" });
  });

  it("maps other HTTP errors to the http key with the status as a param", async () => {
    mockGet.mockRejectedValue(axiosErrorWithStatus(500));

    await expect(infoFor()).resolves.toEqual({ key: "errors.http", params: { status: 500 } });
  });

  it("maps a transport failure to the network key", async () => {
    mockGet.mockRejectedValue(networkError());

    await expect(infoFor()).resolves.toEqual({ key: "errors.network" });
  });

  it("maps non-axios errors to the unknown key", async () => {
    mockGet.mockRejectedValue(new Error("boom"));

    await expect(infoFor()).resolves.toEqual({ key: "errors.unknown" });
  });

  it("never leaks a user-facing English message out of the service", async () => {
    mockGet.mockRejectedValue(axiosErrorWithStatus(429));
    const info = await infoFor();
    expect(info.key.startsWith("errors.")).toBe(true);
  });
});
