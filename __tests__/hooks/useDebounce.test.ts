import { act, renderHook } from "@testing-library/react-native";
import { useDebounce } from "../../src/screens/MainScreen/hooks/useDebounce";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe("useDebounce", () => {
  it("returns the initial value immediately", async () => {
    const { result } = await renderHook(() => useDebounce("fire", 300));
    expect(result.current).toBe("fire");
  });

  it("does not update before the delay elapses", async () => {
    const { result, rerender } = await renderHook<string, { value: string }>(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "a" },
    });

    await rerender({ value: "ab" });
    await act(async () => {
      jest.advanceTimersByTime(299);
    });

    expect(result.current).toBe("a");
  });

  it("updates once the delay elapses", async () => {
    const { result, rerender } = await renderHook<string, { value: string }>(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "a" },
    });

    await rerender({ value: "ab" });
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe("ab");
  });

  it("only emits the final value across rapid changes", async () => {
    const { result, rerender } = await renderHook<string, { value: string }>(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "" },
    });

    for (const value of ["f", "fi", "fir", "fire"]) {
      await rerender({ value });
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
    }

    expect(result.current).toBe("");

    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe("fire");
  });
});
