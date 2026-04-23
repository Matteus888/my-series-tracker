"use client";

import { useEffect, useState, useRef } from "react";

/**
 * Observe les sections jour et renvoie la date YYYY-MM-DD de la section
 * actuellement visible la plus haut dans le viewport.
 *
 * Les sections ciblées doivent porter l'attribut data-date="YYYY-MM-DD".
 */
export function useActiveDay(dates) {
  const [activeDate, setActiveDate] = useState(null);
  const visibilityRef = useRef(new Map()); // date -> ratio

  useEffect(() => {
    if (!dates?.length) return;

    const nodes = dates
      .map((date) => document.querySelector(`[data-date="${date}"]`))
      .filter(Boolean);
    if (nodes.length === 0) return;

    // Reset map — garde uniquement les dates encore présentes
    const map = visibilityRef.current;
    for (const key of map.keys()) {
      if (!dates.includes(key)) map.delete(key);
    }

    const pickActive = () => {
      // La section "active" est celle qui est visible avec le plus grand ratio
      // ET qui apparaît le plus tôt dans le DOM (priorité à la plus haute)
      let best = null;
      let bestRatio = 0;
      for (const date of dates) {
        const ratio = map.get(date) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          best = date;
        }
      }
      if (best) setActiveDate(best);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const date = entry.target.getAttribute("data-date");
          if (!date) continue;
          map.set(date, entry.intersectionRatio);
        }
        pickActive();
      },
      {
        // Déclenche à plusieurs seuils pour suivre la visibilité finement
        threshold: [0, 0.25, 0.5, 0.75, 1],
        // Biais vers le haut de l'écran : la section devient "active"
        // dès qu'elle entre dans la moitié supérieure du viewport
        rootMargin: "-10% 0px -50% 0px",
      },
    );

    nodes.forEach((n) => observer.observe(n));

    return () => observer.disconnect();
  }, [dates]);

  return activeDate;
}
