"use client";

import styles from "./CarouselArrows.module.css";

export default function CarouselArrows({ canScrollLeft, canScrollRight, onScroll }) {
  return (
    <>
      <button
        type="button"
        className={`${styles.arrow} ${styles.left} ${canScrollLeft ? styles.visible : ""}`}
        onClick={() => onScroll("left")}
        aria-label="Scroll left"
        tabIndex={canScrollLeft ? 0 : -1}
      >
        <span className={styles.chevron} aria-hidden="true">
          ‹
        </span>
      </button>
      <button
        type="button"
        className={`${styles.arrow} ${styles.right} ${canScrollRight ? styles.visible : ""}`}
        onClick={() => onScroll("right")}
        aria-label="Scroll right"
        tabIndex={canScrollRight ? 0 : -1}
      >
        <span className={styles.chevron} aria-hidden="true">
          ›
        </span>
      </button>
    </>
  );
}
