"use client";

import styles from "./CalendarSection.module.css";
import { useState } from "react";
import { useCalendar } from "@/hooks/useCalendar";
import Image from "next/image";
import Link from "next/link";

export default function CalendarSection() {
  const { items, loading, error } = useCalendar();

  if (loading) return <SectionSkeleton />;
  if (error) return <p className={styles.error}>Failed to load.</p>;
  if (!items?.length) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Upcoming</h2>
      <div className={styles.carousel}>
        {items.map((day) => (
          <CalendarDayCard key={day.date} day={day} />
        ))}
      </div>
    </section>
  );
}

function CalendarDayCard({ day }) {
  const [hoveredPoster, setHoveredPoster] = useState(day.episodes[0]?.posterPath ?? null);

  const dateLabel = new Date(day.date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className={styles.dayCard}>
      {/* Partie gauche - poster */}
      <div className={styles.posterSection}>
        {hoveredPoster ? (
          <Image
            src={`https://image.tmdb.org/t/p/w185${hoveredPoster}`}
            alt="Season poster"
            width={117}
            height={175}
            sizes="100px"
            loading="eager"
            className={styles.poster}
          />
        ) : (
          <div className={styles.posterPlaceholder} />
        )}
      </div>

      {/* Partie droite - date + épisode */}
      <div className={styles.contentSection}>
        <p className={styles.dateLabel}>{dateLabel}</p>
        <div className={styles.divider} />
        <ul className={styles.episodeList}>
          {day.episodes.map((ep) => {
            const epCode = `S${String(ep.seasonNumber).padStart(2, "0")}E${String(ep.episodeNumber).padStart(2, "0")}`;
            return (
              <li
                key={ep.episodeId}
                className={styles.episodeItem}
                onMouseEnter={() => setHoveredPoster(ep.posterPath)}
                onMouseLeave={() => setHoveredPoster(day.episodes[0]?.posterPath ?? null)}
              >
                <Link href={`/series/${ep.tmdbId}`} className={styles.episodeLink}>
                  <span className={styles.epTitle}>{ep.seriesTitle}</span>
                  <span className={styles.epCode}>{epCode}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Upcoming</h2>
      <div className={styles.carousel}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`card ${styles.skeletonCard}`}>
            <div className={styles.skeletonPoster}>
              <div className={styles.skeletonPulse} />
            </div>
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonDate} />
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLineShort} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
