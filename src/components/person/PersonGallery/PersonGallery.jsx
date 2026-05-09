"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Icon from "@mdi/react";
import { mdiClose, mdiChevronLeft, mdiChevronRight } from "@mdi/js";
import styles from "./PersonGallery.module.css";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";

export default function PersonGallery({ images, personName, storageKey }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();

  const open = (i) => setActiveIndex(i);
  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);
  const next = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

  // Navigation clavier dans la lightbox
  useEffect(() => {
    if (activeIndex === null) return;

    const onKey = (e) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);

    // Lock scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [activeIndex, close, prev, next]);

  if (!images || images.length === 0) return null;

  const activeImage = activeIndex !== null ? images[activeIndex] : null;

  return (
    <>
      <SectionHeader
        title="Photos"
        subtitle={`${images.length} photo${images.length > 1 ? "s" : ""}`}
        storageKey={storageKey}
        defaultOpen={false}
      >
        <div className={styles.carouselContainer}>
          <CarouselArrows canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scrollBy} />
          <div className={styles.track} ref={scrollerRef}>
            {images.map((img, i) => (
              <button
                key={img.filePath}
                type="button"
                className={styles.thumb}
                onClick={() => open(i)}
                aria-label={`View photo ${i + 1} of ${personName}`}
              >
                <Image
                  src={`https://image.tmdb.org/t/p/w300${img.filePath}`}
                  alt=""
                  width={200}
                  height={300}
                  className={styles.thumbImage}
                />
              </button>
            ))}
          </div>
        </div>
      </SectionHeader>

      {/* Lightbox */}
      {activeImage && (
        <div className={styles.lightbox} onClick={close} role="dialog" aria-modal="true">
          <button
            type="button"
            className={`${styles.lightboxBtn} ${styles.closeBtn}`}
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="Close"
          >
            <Icon path={mdiClose} size={1.2} />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.lightboxBtn} ${styles.prevBtn}`}
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous photo"
              >
                <Icon path={mdiChevronLeft} size={1.5} />
              </button>
              <button
                type="button"
                className={`${styles.lightboxBtn} ${styles.nextBtn}`}
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next photo"
              >
                <Icon path={mdiChevronRight} size={1.5} />
              </button>
            </>
          )}

          <div className={styles.lightboxImageWrapper} onClick={(e) => e.stopPropagation()}>
            <Image
              src={`https://image.tmdb.org/t/p/original${activeImage.filePath}`}
              alt={personName}
              width={activeImage.width}
              height={activeImage.height}
              className={styles.lightboxImage}
              priority
            />
          </div>

          {images.length > 1 && (
            <div className={styles.counter}>
              {activeIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
