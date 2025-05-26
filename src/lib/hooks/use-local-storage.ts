
"use client";

import { useState, useEffect, useCallback } from "react";

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state with initialValue. This ensures server and client initial render match.
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isMounted, setIsMounted] = useState(false); // Track mounting state

  // Effect to load from localStorage on client mount (after initial render)
  useEffect(() => {
    setIsMounted(true); // Component has mounted
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
      // If no item, it remains initialValue from useState, which is correct for initial load.
    } catch (error) {
      console.error(`Error reading localStorage key "${key}" on mount:`, error);
      // Fallback to initialValue if parsing fails or other error during mount read
      setStoredValue(initialValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // Only re-read from localStorage if key changes. initialValue is not needed here as it's for initial state.

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === "undefined") {
        console.warn(`Tried setting localStorage key "${key}" outside of client environment.`);
        return;
      }
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue] // storedValue dependency is needed for the functional update `value(storedValue)`
  );

  // Effect for synchronizing with localStorage changes from other tabs/windows
  useEffect(() => {
    if (!isMounted || typeof window === "undefined") {
      // Don't run on server or before initial client mount/load from the first useEffect has completed.
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        if (event.newValue === null) { // Item removed or cleared in another tab
          setStoredValue(initialValue);
        } else {
          try {
            setStoredValue(JSON.parse(event.newValue));
          } catch (error) {
            console.error(`Error parsing storage change for key "${key}":`, error);
            setStoredValue(initialValue); // Fallback
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, initialValue, isMounted]); // isMounted ensures this runs after initial load. initialValue is a dep for fallback.

  return [storedValue, setValue];
}

export default useLocalStorage;
