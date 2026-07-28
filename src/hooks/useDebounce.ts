import { useEffect, useState } from "react";

export const DEFAULT_DEBOUNCE_MS = 300;

export function useDebounce<T>(value: T, delay: number = DEFAULT_DEBOUNCE_MS): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
