"use client";

import styles from "./CastCarousel.module.css";
import { mdiDramaMasks } from "@mdi/js";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";
import CastCard from "../CastCard/CastCard";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";

export default function CastCarousel({ cast = [] }) {
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();

  if (cast.length === 0) return null;

  return (
    <SectionHeader
      icon={mdiDramaMasks}
      title="Cast"
      subtitle={`${cast.length} actors`}
      storageKey="series-cast-open"
      defaultOpen={true}
    >
      <div className={styles.carouselContainer}>
        <CarouselArrows canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scrollBy} />
        <div className={styles.track} ref={scrollerRef}>
          {cast.map((person) => (
            <CastCard key={person.tmdbId} person={person} />
          ))}
        </div>
      </div>
    </SectionHeader>
  );
}
