"use client";

import { createContext, useContext, useRef, useState, useCallback } from "react";

const NavigationProgressContext = createContext(null);

export function NavigationProgressProvider({ children }) {
  const [width, setWidth] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const timersRef = useRef([]);
  const isNavigatingRef = useRef(false);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const t = (fn, delay) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
  };

  const start = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    clearTimers();
    setWidth(0);
    setOpacity(1);
    t(() => setWidth(20), 10);
    t(() => setWidth(50), 200);
    t(() => setWidth(70), 700);
    t(() => setWidth(85), 1600);
  }, []);

  const complete = useCallback(() => {
    if (!isNavigatingRef.current) return;
    clearTimers();
    setWidth(100);
    t(() => setOpacity(0), 200);
    t(() => {
      setWidth(0);
      isNavigatingRef.current = false;
    }, 500);
  }, []);

  return (
    <NavigationProgressContext.Provider value={{ start, complete, width, opacity }}>
      {children}
    </NavigationProgressContext.Provider>
  );
}

export function useNavigationProgress() {
  return useContext(NavigationProgressContext);
}
