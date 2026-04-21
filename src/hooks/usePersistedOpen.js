"use client";

import { useState, useEffect } from "react";

export function usePersistedOpen(key, defaultValue = true) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return defaultValue;
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : defaultValue;
  });

  useEffect(() => {
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(isOpen));
  }, [key, isOpen]);

  return [isOpen, setIsOpen];
}
