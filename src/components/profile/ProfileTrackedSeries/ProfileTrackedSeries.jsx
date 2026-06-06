"use client";

import { useState, useMemo } from "react";
import styles from "./ProfileTrackedSeries.module.css";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import PublicSerieCard from "@/components/profile/PublicSerieCard/PublicSerieCard";

const TABS = [
  { id: "all", label: "All" },
  { id: "watching", label: "Watching" },
  { id: "completed", label: "Completed" },
  { id: "dropped", label: "Dropped" },
  { id: "plan_to_watch", label: "Plan to watch" },
];

export default function ProfileTrackedSeries({
  trackedSeries,
  watchlistSeries = [],
  progressMap,
  activelyWatchingTmdbIds,
  username,
}) {
  const [activeTab, setActiveTab] = useState("all");

  const activeSet = useMemo(() => new Set(activelyWatchingTmdbIds), [activelyWatchingTmdbIds]);

  // "All" = tracked + watchlist (séries de la watchlist marquées comme plan_to_watch)
  const allSeries = useMemo(() => [...trackedSeries, ...watchlistSeries], [trackedSeries, watchlistSeries]);

  const counts = useMemo(() => {
    const c = {
      all: allSeries.length,
      watching: 0,
      completed: 0,
      dropped: 0,
      plan_to_watch: watchlistSeries.length,
    };
    for (const t of trackedSeries) {
      if (t.status === "dropped") c.dropped += 1;
      else if (activeSet.has(t.tmdbId)) c.watching += 1;
      else c.completed += 1;
    }
    return c;
  }, [trackedSeries, watchlistSeries, allSeries, activeSet]);

  const filtered = useMemo(() => {
    switch (activeTab) {
      case "all":
        return allSeries;
      case "plan_to_watch":
        return watchlistSeries;
      case "dropped":
        return trackedSeries.filter((t) => t.status === "dropped");
      case "watching":
        return trackedSeries.filter((t) => activeSet.has(t.tmdbId) && t.status !== "dropped");
      case "completed":
        return trackedSeries.filter((t) => !activeSet.has(t.tmdbId) && t.status !== "dropped");
      default:
        return [];
    }
  }, [activeTab, trackedSeries, watchlistSeries, allSeries, activeSet]);

  if (allSeries.length === 0) return null;

  return (
    <SectionHeader
      title="All tracked series"
      subtitle={`${trackedSeries.length} series`}
      storageKey={`profile-${username}-tracked-open`}
      defaultOpen
    >
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
            <span className={styles.tabCount}>{counts[tab.id] ?? 0}</span>
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map((t) => (
            <PublicSerieCard key={t.tmdbId} tracked={t} progress={progressMap[String(t.tmdbId)]} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>No series in this category.</p>
      )}
    </SectionHeader>
  );
}
