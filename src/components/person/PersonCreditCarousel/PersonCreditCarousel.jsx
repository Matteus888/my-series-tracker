"use client";

import styles from "./PersonCreditCarousel.module.css";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";
import SerieCreditCard from "@/components/person/SerieCreditCard/SerieCreditCard";

export default function PersonCreditCarousel({ title, subtitle, credits, storageKey, defaultOpen = true }) {
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();

  if (!credits || credits.length === 0) return null;

  return (
    <SectionHeader
      title={title}
      subtitle={subtitle ?? `${credits.length} title${credits.length > 1 ? "s" : ""}`}
      storageKey={storageKey}
      defaultOpen={defaultOpen}
    >
      <div className={styles.carouselContainer}>
        <CarouselArrows canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scrollBy} />
        <div className={styles.track} ref={scrollerRef}>
          {credits.map((credit, idx) => (
            <div key={`${credit.tmdbId}-${idx}`} className={styles.cardSlot}>
              <SerieCreditCard credit={credit} />
            </div>
          ))}
        </div>
      </div>
    </SectionHeader>
  );
}
