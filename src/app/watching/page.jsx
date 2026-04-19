"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import ProgressCard from "@/components/series/ProgressCard/ProgressCard";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";

export default function WatchingPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { incrementWatched } = useTrackedSeries();

  useEffect(() => {
    fetch("/api/watching")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? []);
        setLoading(false);
      });
  }, []);

  const checkEpisode = useCallback(
    async (seriesId, episodeId) => {
      const previous = items;
      setItems((current) =>
        current
          .map((item) => {
            if (item.seriesId !== seriesId) return item;
            const newWatchedCount = item.watchedCount + 1;
            if (newWatchedCount >= item.totalCount) return null;
            return { ...item, watchedCount: newWatchedCount, nextEpisode: null };
          })
          .filter(Boolean),
      );
      try {
        const res = await fetch(`/api/episodes/${episodeId}/watched`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watched: true }),
        });
        if (!res.ok) throw new Error("Failed");
        incrementWatched();
        const refreshed = await fetch("/api/watching");
        const data = await refreshed.json();
        setItems(data.items ?? []);
      } catch {
        setItems(previous);
      }
    },
    [items, incrementWatched],
  );

  if (loading)
    return (
      <div className={styles.page}>
        <h3 className={styles.title}>Continue watching</h3>
        <p className={styles.muted}>Loading...</p>
      </div>
    );
  if (items.length === 0) return <p className={styles.empty}>No series in progress.</p>;

  return (
    <div className={styles.page}>
      <h3 className={styles.title}>Continue watching</h3>
      <p className={styles.count}>{items.length} series in progress</p>
      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.seriesId} className={styles.gridItem}>
            <ProgressCard item={item} onCheck={checkEpisode} />
          </div>
        ))}
      </div>
    </div>
  );
}
