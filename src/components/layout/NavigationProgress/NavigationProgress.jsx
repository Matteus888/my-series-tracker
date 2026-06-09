"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useNavigationProgress } from "@/context/NavigationProgressContext";
import styles from "./NavigationProgress.module.css";

export default function NavigationProgress() {
  const pathname = usePathname();
  const { start, complete, width, opacity } = useNavigationProgress();

  // Complétion à chaque changement de route
  useEffect(() => {
    complete();
  }, [pathname]);

  // Listener pour les <a> (Link Next.js)
  useEffect(() => {
    const handleClick = (e) => {
      const anchor = e.target.closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname) return;
      } catch {
        return;
      }
      start();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return (
    <div
      className={styles.bar}
      style={{
        width: `${width}%`,
        opacity,
        transition: width === 100 ? "width 0.2s ease" : width === 0 ? "none" : "width 0.5s ease",
      }}
    />
  );
}
