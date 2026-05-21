"use client";

import styles from "./ProfileCurrentlyWatching.module.css";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";
import PublicContinueWatchingCard from "@/components/profile/PublicContinueWatchingCard/PublicContinueWatchingCard";

export default function ProfileCurrentlyWatching({ items, username }) {
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();

  if (!items || items.length === 0) return null;

  return (
    <SectionHeader
      title="Currently watching"
      subtitle={`${items.length} series`}
      storageKey={`profile-${username}-watching-open`}
      defaultOpen
    >
      <div className={styles.carouselContainer}>
        <CarouselArrows canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scrollBy} />
        <div className={styles.track} ref={scrollerRef}>
          {items.map((item) => (
            <div key={item.seriesId} className={styles.cardSlot}>
              <PublicContinueWatchingCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </SectionHeader>
  );
}
