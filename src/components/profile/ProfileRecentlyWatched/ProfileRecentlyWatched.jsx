"use client";

import styles from "./ProfileRecentlyWatched.module.css";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";
import WatchedEpisodeCard from "@/components/dashboard/WatchedEpisodeCard/WatchedEpisodeCard";
export default function ProfileRecentlyWatched({ episodes, username }) {
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();

  if (!episodes || episodes.length === 0) return null;

  return (
    <SectionHeader
      title="Recently watched"
      subtitle={`${episodes.length} episode${episodes.length > 1 ? "s" : ""}`}
      storageKey={`profile-${username}-recently-open`}
      defaultOpen
    >
      <div className={styles.carouselContainer}>
        <CarouselArrows canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scrollBy} />
        <div className={styles.track} ref={scrollerRef}>
          {episodes.map((ep) => (
            <div key={ep._id} className={styles.cardSlot}>
              <WatchedEpisodeCard ep={ep} showSeason showDate disableTooltip readOnly />
            </div>
          ))}
        </div>
      </div>
    </SectionHeader>
  );
}
