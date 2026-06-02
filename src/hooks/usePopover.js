"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export const usePopover = (externalRef = null) => {
  const [isOpen, setIsOpen] = useState(false);
  const justClosedRef = useRef(false);
  const internalRef = useRef(null);
  const popoverRef = externalRef ?? internalRef;

  const close = useCallback(() => {
    justClosedRef.current = true;
    setIsOpen(false);

    const blockClick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      document.removeEventListener("click", blockClick, true);
    };
    document.addEventListener("click", blockClick, true);

    setTimeout(() => {
      justClosedRef.current = false;
      document.removeEventListener("click", blockClick, true);
    }, 200);
  }, []);

  const open = useCallback(() => {
    if (justClosedRef.current) {
      justClosedRef.current = false;
      return;
    }
    setIsOpen(true);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, close, open]);

  // Clic outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close, popoverRef]);

  return { isOpen, open, close, toggle, popoverRef };
};
