"use client";

import styles from "./SuggestionsSection.module.css";
import { useSuggestions } from "@/hooks/useSuggestions";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";
import SerieCard from "@/components/series/SerieCard/SerieCard";
import SectionHeader from "../../ui/SectionHeader/SectionHeader";
import SectionEmptyState from "../SectionEmptyState/SectionEmptyState";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";
import { mdiLightbulbOutline } from "@mdi/js";

export default function SuggestionsSection() {
  const { items, loading, error } = useSuggestions();
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();

  if (error) return <p className={styles.error}>Failed to load.</p>;

  const isEmpty = !loading && (!items || items.length === 0);

  return (
    <section className={styles.section}>
      <SectionHeader
        title="Suggested for you"
        icon={mdiLightbulbOutline}
        storageKey="section-suggestions"
        defaultOpen={true}
        hasContent={items.length > 0}
      >
        <div className={styles.carouselWrapper}>
          {loading ? (
            <div className={styles.carousel} ref={scrollerRef}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeletonContainer}>
                  <div className={`card ${styles.skeletonCard}`}>
                    <div className={styles.skeletonImage}>
                      <div className={styles.skeletonPulse} />
                    </div>
                    <div className={styles.skeletonFooter}>
                      <div className={styles.skeletonButton} />
                      <div className={styles.skeletonButton} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <SectionEmptyState
              icon={mdiLightbulbOutline}
              message="Track a few shows you love and we'll suggest similar ones based on your taste."
              ctaLabel="Discover shows"
              ctaHref="/series"
            />
          ) : (
            <div className={styles.carousel} ref={scrollerRef}>
              {items.map((serie) => (
                <SerieCard key={serie.id} serie={serie} width={175} />
              ))}
            </div>
          )}
          {!isEmpty && (
            <CarouselArrows canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scrollBy} />
          )}
        </div>
      </SectionHeader>
    </section>
  );
}
