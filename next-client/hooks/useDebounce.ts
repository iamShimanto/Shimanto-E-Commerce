"use client";

import { useEffect, useState } from "react";

export interface UseDebounceOptions<T> {
  equalityFn?: (previousValue: T, nextValue: T) => boolean;
}

export function useDebounce<T>(
  value: T,
  delay = 300,
  options: UseDebounceOptions<T> = {},
) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const isEqual = options.equalityFn ?? Object.is;

  useEffect(() => {
    if (isEqual(debouncedValue, value)) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, delay, debouncedValue, isEqual]);

  return debouncedValue;
}

export default useDebounce;
