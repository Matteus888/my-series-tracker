"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook pour gérer les flèches de navigation d'un carousel à scroll horizontal.
 * Renvoie :
 * - scrollerRef     : à attacher sur l'élément scrollable (le .carousel)
 * - canScrollLeft   : booléen, true s'il y a du contenu caché à gauche
 * - canScrollRight  : booléen, true s'il y a du contenu caché à droite
 * - scrollBy(dir)   : scrolle de ~80% de la largeur visible ('left' | 'right')
 */
export function useCarouselArrows() {
  const scrollerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Recalcule l'état des flèches en lisant les dimensions du scroller.
  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // marge de tolérance pour éviter les flickers à 1px près
    const epsilon = 2;
    setCanScrollLeft(el.scrollLeft > epsilon);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - epsilon);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    updateArrows();

    // Scroll de l'utilisateur
    el.addEventListener("scroll", updateArrows, { passive: true });

    // Resize de la fenêtre (largeur visible change)
    window.addEventListener("resize", updateArrows);

    // Resize du contenu interne (images qui finissent de charger,
    // cartes ajoutées dynamiquement, etc.)
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    // observe aussi les enfants directs pour capter les changements de scrollWidth
    Array.from(el.children).forEach((child) => ro.observe(child));

    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
      ro.disconnect();
    };
  }, [updateArrows]);

  const scrollBy = useCallback((direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollTo({
      left: el.scrollLeft + (direction === "left" ? -amount : amount),
      behavior: "smooth",
    });
  }, []);

  return { scrollerRef, canScrollLeft, canScrollRight, scrollBy };
}
