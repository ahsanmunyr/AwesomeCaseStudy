import { act, renderHook } from "@testing-library/react-native";
import { useDebounce } from "../../src/hooks/useDebounce";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useDebounce", () => {
  it("returns the first value straight away", async () => {
    const { result } = await renderHook(() => useDebounce("fire", 300));

    expect(result.current).toBe("fire");
  });

  it("waits for the delay before returning a new value", async () => {
    const { result, rerender } = await renderHook<string, { value: string }>(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "fire" },
    });

    await rerender({ value: "fireball" });
    expect(result.current).toBe("fire");

    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe("fireball");
  });

  it("only returns the last value when the user keeps typing", async () => {
    const { result, rerender } = await renderHook<string, { value: string }>(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "f" },
    });

    await rerender({ value: "fi" });
    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    await rerender({ value: "fir" });
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe("fir");
  });
});
