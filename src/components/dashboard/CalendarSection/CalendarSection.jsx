"use client";

import styles from "./CalendarSection.module.css";
import { useCalendar } from "@/hooks/useCalendar";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";
import SectionHeader from "../SectionHeader/SectionHeader";
import SectionEmptyState from "../SectionEmptyState/SectionEmptyState";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";
import CalendarDayCard from "../CalendarDayCard/CalendarDayCard";
import { mdiCalendarClockOutline } from "@mdi/js";

export default function CalendarSection() {
  const { items, loading, error } = useCalendar();
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();

  if (error) return <p className={styles.error}>Failed to load.</p>;

  const visibleItems = items ?? [];
  const isEmpty = !loading && visibleItems.length === 0;

  return (
    <section className={styles.section}>
      <SectionHeader
        title="Upcoming"
        href={isEmpty ? undefined : "/calendar"}
        icon={mdiCalendarClockOutline}
        storageKey="section-calendar"
        defaultOpen={true}
        hasContent={items.length > 0}
      >
        <div className={styles.carouselWrapper}>
          {loading ? (
            <div className={styles.carousel} ref={scrollerRef}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`card ${styles.skeletonCard}`}>
                  <div className={styles.skeletonPoster}>
                    <div className={styles.skeletonPulse} />
                  </div>
                  <div className={styles.skeletonContent}>
                    <div className={styles.skeletonDate} />
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLineShort} />
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLineShort} />
                  </div>
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <SectionEmptyState
              icon={mdiCalendarClockOutline}
              message="Track currently airing shows to see upcoming episodes and never miss a premiere or finale."
              ctaLabel="Find airing shows"
              ctaHref="/series"
            />
          ) : (
            <div className={styles.carousel} ref={scrollerRef}>
              {visibleItems.map((day) => (
                <CalendarDayCard key={day.date} day={day} />
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
