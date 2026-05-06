"use client";

import styles from "./ContinueWatchingSection.module.css";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";
import ContinueWatchingCard from "@/components/dashboard/ContinueWatchingCard/ContinueWatchingCard";
import SectionHeader from "../../ui/SectionHeader/SectionHeader";
import SectionEmptyState from "../SectionEmptyState/SectionEmptyState";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";
import { mdiTelevisionPlay } from "@mdi/js";

export default function ContinueWatchingSection({ initialSkeletonCount = 0 }) {
  const { items, loading, error, checkEpisode } = useContinueWatching();
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();

  if (error) return <p className={styles.error}>Failed to load.</p>;

  const isEmpty = !loading && items.length === 0;

  return (
    <section className={styles.section}>
      <SectionHeader
        title="Continue watching"
        href={isEmpty ? undefined : "/watching"}
        icon={mdiTelevisionPlay}
        storageKey="section-continue-watching"
        defaultOpen={true}
        hasContent={items.length > 0}
      >
        <div className={styles.carouselWrapper}>
          {!loading ? (
            initialSkeletonCount === 0 ? null : (
              <div className={styles.carousel} ref={scrollerRef}>
                {Array.from({ length: Math.min(initialSkeletonCount, 10) }).map((_, i) => (
                  <div key={i} className={styles.skeletonContainer}>
                    <div className={`card ${styles.skeletonCard}`}>
                      <div className={styles.skeletonImage}>
                        <div className={styles.skeletonPulse} />
                      </div>
                      <div className={styles.skeletonFooter}>
                        <div className={styles.skeletonButton} />
                        <div className={styles.skeletonText}>
                          <div className={styles.skeletonLabel} />
                          <div className={styles.skeletonLabel} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : isEmpty ? (
            <SectionEmptyState
              icon={mdiTelevisionPlay}
              message="Start a series and the episodes you haven't finished yet will show up here, ready to be picked up."
              ctaLabel="Browse series"
              ctaHref="/series"
            />
          ) : (
            <div className={styles.carousel} ref={scrollerRef}>
              {items.map((item) => (
                <ContinueWatchingCard key={item.seriesId} item={item} onCheck={checkEpisode} />
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
