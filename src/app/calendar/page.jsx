"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import ProgressCard from "@/components/series/ProgressCard/ProgressCard";
import { formatDateLabel } from "@/lib/utils/date.utils";

export default function CalendarPage() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((d) => {
        setDays(d.calendar ?? []);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className={styles.page}>
        <h2 className={styles.title}>Upcoming</h2>
        <p className={styles.muted}>Loading...</p>
      </div>
    );

  if (days.length === 0)
    return (
      <div className={styles.page}>
        <h2 className={styles.title}>Upcoming</h2>
        <p className={styles.muted}>No upcoming episodes.</p>
      </div>
    );

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Upcoming</h2>
      {days.map((day) => (
        <div key={day.date} className={styles.daySection}>
          <h2 className={styles.dateLabel}>{formatDateLabel(day.date)}</h2>
          <div className={styles.grid}>
            {day.episodes.map((ep) => {
              const item = {
                seriesId: ep.seriesId,
                tmdbId: ep.tmdbId,
                title: ep.seriesTitle,
                posterPath: ep.posterPath,
                networks: ep.networks ?? [],
                watchedCount: 0,
                totalCount: 1,
                remainingCount: 0,
                totalRemainingDuration: 0,
                seasonEpisodeCount: ep.seasonEpisodeCount ?? null,
                nextEpisode: {
                  _id: ep.episodeId,
                  seasonNumber: ep.seasonNumber,
                  episodeNumber: ep.episodeNumber,
                  title: ep.title,
                  airDate: ep.airDate,
                },
              };
              return (
                <div key={ep.episodeId} className={styles.gridItem}>
                  <ProgressCard item={item} compact />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
