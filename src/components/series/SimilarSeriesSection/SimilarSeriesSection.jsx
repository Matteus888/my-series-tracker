"use client";

import styles from "./SimilarSeriesSection.module.css";
import { useSimilarSeries } from "@/hooks/useSimilarSeries";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";
import SerieCard from "@/components/series/SerieCard/SerieCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";
import { mdiTelevisionGuide } from "@mdi/js";

export default function SimilarSeriesSection({ tmdbId }) {
  const { items, loading, error } = useSimilarSeries(tmdbId);
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();

  if (error) return <p className={styles.error}>Failed to load.</p>;

  const isEmpty = !loading && (!items || items.length === 0);

  // Si aucun résultat, on n'affiche rien du tout (pas d'empty state utile ici)
  if (isEmpty) return null;

  return (
    <section className={styles.section}>
      <SectionHeader
        title="Similar shows"
        icon={mdiTelevisionGuide}
        storageKey={`section-similar-${tmdbId}`}
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
          ) : (
            <div className={styles.carousel} ref={scrollerRef}>
              {items.map((serie) => (
                <SerieCard key={serie.id} serie={serie} width={175} />
              ))}
            </div>
          )}
          <CarouselArrows canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scrollBy} />
        </div>
      </SectionHeader>
    </section>
  );
}
