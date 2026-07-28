import { useEffect, useState } from "react";

export const DEFAULT_DEBOUNCE_MS = 300;

/**
 * Returns `value` only after it has stopped changing for `delay` ms. Keeps the
 * expensive filter pass off every keystroke.
 */
export function useDebounce<T>(value: T, delay: number = DEFAULT_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebounce;
