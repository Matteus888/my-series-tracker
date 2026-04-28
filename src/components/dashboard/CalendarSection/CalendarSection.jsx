"use client";

import styles from "./CalendarSection.module.css";
import { useState } from "react";
import { useCalendar } from "@/hooks/useCalendar";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";
import { formatDateLabel } from "@/lib/utils/date.utils";
import { formatDuration } from "@/lib/utils/duration.utils";
import Image from "next/image";
import Link from "next/link";
import SectionHeader from "../SectionHeader/SectionHeader";
import SectionEmptyState from "../SectionEmptyState/SectionEmptyState";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";
import { mdiCalendarClockOutline } from "@mdi/js";

export default function CalendarSection() {
  const { items, loading, error } = useCalendar();
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();

  // const today = new Date().toISOString().slice(0, 10);

  if (error) return <p className={styles.error}>Failed to load.</p>;

  // const visibleItems = items?.filter((day) => day.date !== today) ?? [];
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

function CalendarDayCard({ day }) {
  const [hoveredEp, setHoveredEp] = useState(day.episodes[0] ?? null);
  const dateLabel = formatDateLabel(day.date, { showTomorrow: false });

  const network = hoveredEp?.networks?.[0];
  const formattedDuration = hoveredEp?.duration ? formatDuration(hoveredEp.duration) : null;

  return (
    <div className={`card ${styles.dayCard}`}>
      <div className={styles.posterSection}>
        {hoveredEp?.posterPath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w185${hoveredEp.posterPath}`}
            alt="Season poster"
            width={156}
            height={233}
            sizes="156px"
            loading="eager"
            className={styles.poster}
          />
        ) : (
          <div className={styles.posterPlaceholder} />
        )}
      </div>
      <div className={styles.contentSection}>
        <p className={styles.dateLabel}>{dateLabel}</p>
        <ul className={styles.episodeList}>
          {day.episodes.map((ep) => {
            const isBatch = ep.type === "season-batch";
            const key = isBatch ? ep.batchKey : ep.episodeId;

            const epCode = isBatch
              ? `Season ${ep.seasonNumber}`
              : `S${String(ep.seasonNumber).padStart(2, "0")} • E${String(ep.episodeNumber).padStart(2, "0")}`;

            const isPremiere = !isBatch && ep.episodeNumber === 1;
            const isFinale = !isBatch && ep.seasonEpisodeCount != null && ep.episodeNumber === ep.seasonEpisodeCount;
            const badge = isPremiere
              ? { label: "Premiere", className: styles.badgePremiere }
              : isFinale
                ? { label: "Final", className: styles.badgeFinal }
                : null;
            return (
              <li
                key={key}
                className={styles.episodeItem}
                onMouseEnter={() => setHoveredEp(ep)}
                onMouseLeave={() => setHoveredEp(day.episodes[0] ?? null)}
              >
                <Link href={`/series/${ep.tmdbId}`} className={styles.episodeLink}>
                  <span className={styles.epTitle}>{ep.seriesTitle}</span>
                  <span className={styles.epCodeRow}>
                    <span className={styles.epCode}>{epCode}</span>
                    {badge && <span className={`${styles.badge} ${badge.className}`}>{badge.label}</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className={styles.cardFooter}>
          {formattedDuration && <span className={styles.footerMeta}>{formattedDuration}</span>}
          {network?.logoPath && (
            <Image
              src={`https://image.tmdb.org/t/p/w92${network.logoPath}`}
              alt={network.name}
              width={32}
              height={32}
              loading="eager"
              className={styles.footerNetworkLogo}
            />
          )}
        </div>
      </div>
    </div>
  );
}
