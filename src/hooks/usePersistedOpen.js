"use client";

import { useSyncExternalStore, useCallback } from "react";

// Subscribe au storage event pour rester en sync entre onglets
const subscribe = (callback) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

export function usePersistedOpen(key, defaultValue = true) {
  // Snapshot côté client : lit localStorage
  const getSnapshot = useCallback(() => {
    if (!key) return JSON.stringify(defaultValue);
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? stored : JSON.stringify(defaultValue);
    } catch {
      return JSON.stringify(defaultValue);
    }
  }, [key, defaultValue]);

  // Snapshot côté serveur : toujours defaultValue (donc HTML cohérent)
  const getServerSnapshot = useCallback(() => {
    return JSON.stringify(defaultValue);
  }, [defaultValue]);

  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isOpen = JSON.parse(stored);

  const setIsOpen = useCallback(
    (next) => {
      if (!key) return;
      try {
        const value = typeof next === "function" ? next(isOpen) : next;
        localStorage.setItem(key, JSON.stringify(value));
        // Force re-render des autres consommateurs du même key
        window.dispatchEvent(new StorageEvent("storage", { key }));
      } catch {
        // ignore
      }
    },
    [key, isOpen],
  );

  return [isOpen, setIsOpen];
}
