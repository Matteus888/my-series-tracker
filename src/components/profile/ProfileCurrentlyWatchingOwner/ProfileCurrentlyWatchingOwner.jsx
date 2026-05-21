"use client";

import styles from "./ProfileCurrentlyWatchingOwner.module.css";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import ContinueWatchingCard from "@/components/dashboard/ContinueWatchingCard/ContinueWatchingCard";

export default function ProfileCurrentlyWatchingOwner({ username }) {
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();
  const { items, loading, checkEpisode } = useContinueWatching();

  if (loading || !items || items.length === 0) return null;

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
              <ContinueWatchingCard item={item} onCheck={checkEpisode} />
            </div>
          ))}
        </div>
      </div>
    </SectionHeader>
  );
}
