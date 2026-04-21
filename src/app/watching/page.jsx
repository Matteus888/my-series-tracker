"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import PageTitle from "@/components/ui/PageTitle/PageTitle";
import ContinueWatchingCard from "@/components/dashboard/ContinueWatchingCard/ContinueWatchingCard";
import PageLoader from "@/components/ui/PageLoader/PageLoader";
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
        <PageTitle title="Continue watching" />
        <PageLoader />
      </div>
    );

  if (items.length === 0)
    return (
      <div className={styles.page}>
        <PageTitle title="Continue watching" />
        <p className={styles.empty}>No series in progress.</p>
      </div>
    );

  return (
    <div className={styles.page}>
      <PageTitle title="Continue watching" />
      <p className={styles.subtitle}>Pick up where you left off</p>
      <p className={styles.count}>
        {items.length} serie{items.length > 1 ? "s" : ""} in progress
      </p>
      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.seriesId} className={styles.gridItem}>
            <ContinueWatchingCard item={item} onCheck={checkEpisode} />
          </div>
        ))}
      </div>
    </div>
  );
}
