"use client";

import styles from "./CarouselArrows.module.css";
import Icon from "@mdi/react";
import { mdiChevronLeft, mdiChevronRight } from "@mdi/js";

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
        <span className={styles.chevron}>
          <Icon path={mdiChevronLeft} size={1.2} />
        </span>
      </button>
      <button
        type="button"
        className={`${styles.arrow} ${styles.right} ${canScrollRight ? styles.visible : ""}`}
        onClick={() => onScroll("right")}
        aria-label="Scroll right"
        tabIndex={canScrollRight ? 0 : -1}
      >
        <span className={styles.chevron}>
          <Icon path={mdiChevronRight} size={1.2} />
        </span>
      </button>
    </>
  );
}
