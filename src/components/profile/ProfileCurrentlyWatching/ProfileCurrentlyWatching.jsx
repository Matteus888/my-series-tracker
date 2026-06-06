"use client";

import styles from "../ProfileCarousel.module.css";
import { useMemo } from "react";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";
import PublicSerieCard from "@/components/profile/PublicSerieCard/PublicSerieCard";

export default function ProfileCurrentlyWatching({ trackedSeries, progressMap, activelyWatchingTmdbIds, username }) {
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();

  const watching = useMemo(() => {
    const activeSet = new Set(activelyWatchingTmdbIds);
    return (trackedSeries ?? []).filter((t) => activeSet.has(t.tmdbId) && t.status !== "dropped");
  }, [trackedSeries, activelyWatchingTmdbIds]);
  if (watching.length === 0) return null;

  return (
    <SectionHeader
      title="Currently watching"
      subtitle={`${watching.length} series`}
      storageKey={`profile-${username}-watching-open`}
      defaultOpen
    >
      <div className={styles.carouselContainer}>
        <CarouselArrows canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scrollBy} />
        <div className={styles.track} ref={scrollerRef}>
          {watching.map((t) => (
            <div key={t.tmdbId} className={styles.cardSlot}>
              <PublicSerieCard tracked={t} progress={progressMap[String(t.tmdbId)]} />
            </div>
          ))}
        </div>
      </div>
    </SectionHeader>
  );
}
