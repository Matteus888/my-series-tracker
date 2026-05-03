"use client";

import styles from "./CastCarousel.module.css";
import Image from "next/image";
import Link from "next/link";
import Icon from "@mdi/react";
import { mdiChevronLeft, mdiChevronRight } from "@mdi/js";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";

export default function CastCarousel({ cast = [] }) {
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();

  if (cast.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Cast</h3>
      </div>

      <div className={styles.carouselContainer}>
        {canScrollLeft && (
          <button
            className={`${styles.arrow} ${styles.arrowLeft} search-nav-arrow`}
            onClick={() => scrollBy("left")}
            aria-label="Scroll left"
          >
            <Icon path={mdiChevronLeft} size={1.4} />
          </button>
        )}

        <div className={styles.carousel} ref={scrollerRef}>
          {cast.map((person) => (
            <Link key={person.tmdbId} href={`/person/${person.tmdbId}`} className={styles.castItem}>
              <div className={styles.imageWrapper}>
                {person.profilePath ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w185${person.profilePath}`}
                    alt={person.name}
                    fill
                    sizes="120px"
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.placeholder}>
                    <span>{person.name?.charAt(0) ?? "?"}</span>
                  </div>
                )}
              </div>
              <div className={styles.info}>
                <span className={styles.name}>{person.name}</span>
                {person.character && <span className={styles.character}>{person.character}</span>}
              </div>
            </Link>
          ))}
        </div>

        {canScrollRight && (
          <button
            className={`${styles.arrow} ${styles.arrowRight} search-nav-arrow`}
            onClick={() => scrollBy("right")}
            aria-label="Scroll right"
          >
            <Icon path={mdiChevronRight} size={1.4} />
          </button>
        )}
      </div>
    </div>
  );
}
