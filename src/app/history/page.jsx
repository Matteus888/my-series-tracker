"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import EpisodeCard from "@/components/series/EpisodeCard/EpisodeCard";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import { formatDateLabel } from "@/lib/utils/date.utils";

export default function HistoryPage() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const { incrementWatched } = useTrackedSeries();

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => {
        setDays(d.history ?? []);
        setLoading(false);
      });
  }, []);

  const uncheckEpisode = useCallback(
    async (episodeId) => {
      setDays((prev) =>
        prev
          .map((day) => ({
            ...day,
            episodes: day.episodes.filter((ep) => ep._id !== episodeId),
          }))
          .filter((day) => day.episodes.length > 0),
      );
      try {
        const res = await fetch(`/api/episodes/${episodeId}/watched`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watched: false }),
        });
        if (!res.ok) throw new Error("Failed");
        incrementWatched();
      } catch {
        fetch("/api/history")
          .then((r) => r.json())
          .then((d) => setDays(d.history ?? []));
      }
    },
    [incrementWatched],
  );

  if (loading)
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>History</h1>
        <p className={styles.muted}>Loading...</p>
      </div>
    );

  if (days.length === 0)
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>History</h1>
        <p className={styles.muted}>No episodes watched in the last 30 days.</p>
      </div>
    );

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>History</h1>
      {days.map((day) => (
        <div key={day.date} className={styles.daySection}>
          <h2 className={styles.dateLabel}>{formatDateLabel(day.date)}</h2>
          <div className={styles.episodeGrid}>
            {day.episodes.map((ep) => (
              <div key={ep._id} className={styles.cardWrapper}>
                <EpisodeCard ep={ep} onToggle={uncheckEpisode} seriesTitle={ep.seriesTitle} showSeason />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
