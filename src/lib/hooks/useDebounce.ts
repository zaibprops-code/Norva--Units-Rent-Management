"use client";

import { useState, useEffect } from "react";

/**
 * Debounce a value — useful for search inputs to avoid excessive API calls.
 * Usage: const debouncedSearch = useDebounce(searchValue, 300);
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
