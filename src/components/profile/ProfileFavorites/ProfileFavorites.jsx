"use client";

import styles from "../ProfileCarousel.module.css";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";
import PublicSerieCard from "@/components/profile/PublicSerieCard/PublicSerieCard";

export default function ProfileFavorites({ trackedSeries, progressMap, username }) {
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();

  const favorites = (trackedSeries ?? []).filter((t) => t.isFavorite);
  if (favorites.length === 0) return null;

  return (
    <SectionHeader
      title="Favorites"
      subtitle={`${favorites.length} series`}
      storageKey={`profile-${username}-favorites-open`}
      defaultOpen
    >
      <div className={styles.carouselContainer}>
        <CarouselArrows canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scrollBy} />
        <div className={styles.track} ref={scrollerRef}>
          {favorites.map((t) => (
            <div key={t.tmdbId} className={styles.cardSlot}>
              <PublicSerieCard tracked={t} progress={progressMap[String(t.tmdbId)]} />
            </div>
          ))}
        </div>
      </div>
    </SectionHeader>
  );
}
