"use client";

import { useState, useEffect, useCallback } from "react";

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === "undefined") {
        console.warn(`Tried setting localStorage key "${key}" even though environment is not a client`);
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
    [key, storedValue]
  );
  
  useEffect(() => {
    // This effect ensures that the state is updated if localStorage changes from another tab/window.
    // It also ensures that the initial state is correctly set from localStorage on the client side.
    if (typeof window === "undefined") {
      return;
    }
    try {
      const item = window.localStorage.getItem(key);
      const deserializedItem = item ? JSON.parse(item) : initialValue;
      // Only update if the deserialized item is different from the current state
      // This check helps prevent unnecessary re-renders if the stored value is complex
      if (JSON.stringify(deserializedItem) !== JSON.stringify(storedValue)) {
        setStoredValue(deserializedItem);
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}" in useEffect:`, error);
      setStoredValue(initialValue);
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch (error) {
          console.error(`Error parsing storage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, initialValue]); // storedValue removed from deps to avoid loop with setValue


  return [storedValue, setValue];
}

export default useLocalStorage;
