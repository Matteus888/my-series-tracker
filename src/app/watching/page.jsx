"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./page.module.css";
import PageTitle from "@/components/ui/PageTitle/PageTitle";
import ContinueWatchingCard from "@/components/dashboard/ContinueWatchingCard/ContinueWatchingCard";
import PageLoader from "@/components/ui/PageLoader/PageLoader";
import WatchingHeader from "@/components/watching/WatchingHeader/WatchingHeader";
import EmptyStateCard from "@/components/series/EmptyStateCard/EmptyStateCard";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import { mdiTelevisionPlay } from "@mdi/js";

export default function WatchingPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { trackedSeries, incrementWatched } = useTrackedSeries();

  const orderRef = useRef(null);

  const applyPreservedOrder = useCallback((freshItems) => {
    const previousOrder = orderRef.current;

    if (!previousOrder) {
      orderRef.current = new Map(freshItems.map((it, i) => [it.seriesId, i]));
      return freshItems;
    }

    const sorted = [...freshItems].sort((a, b) => {
      const ai = previousOrder.has(a.seriesId) ? previousOrder.get(a.seriesId) : Infinity;
      const bi = previousOrder.has(b.seriesId) ? previousOrder.get(b.seriesId) : Infinity;
      if (ai !== bi) return ai - bi;
      return freshItems.indexOf(a) - freshItems.indexOf(b);
    });

    orderRef.current = new Map(sorted.map((it, i) => [it.seriesId, i]));
    return sorted;
  }, []);

  // Reset l'ordre si l'ensemble des séries trackées change
  useEffect(() => {
    orderRef.current = null;
  }, [trackedSeries]);

  useEffect(() => {
    fetch("/api/watching")
      .then((r) => r.json())
      .then((d) => {
        setItems(applyPreservedOrder(d.items ?? []));
        setLoading(false);
      });
  }, [applyPreservedOrder]);

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
        setItems(applyPreservedOrder(data.items ?? []));
      } catch {
        setItems(previous);
      }
    },
    [items, incrementWatched, applyPreservedOrder],
  );

  if (loading)
    return (
      <div className={styles.page}>
        <PageTitle title="Continue watching" icon={mdiTelevisionPlay} />
        <WatchingHeader items={items} isLoading={loading} />
        <PageLoader />
      </div>
    );

  if (items.length === 0)
    return (
      <div className={styles.page}>
        <PageTitle title="Continue watching" icon={mdiTelevisionPlay} />
        <WatchingHeader items={items} isLoading={loading} />
        <EmptyStateCard
          icon={mdiTelevisionPlay}
          label="Nothing in progress"
          subtitle="Start watching a show to see it here"
        />
      </div>
    );

  return (
    <div className={styles.page}>
      <PageTitle title="Continue watching" icon={mdiTelevisionPlay} />
      <WatchingHeader items={items} isLoading={loading} />
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
