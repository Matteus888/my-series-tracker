"use client";

import { useState, useMemo } from "react";
import styles from "./ProfileTrackedSeries.module.css";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import PublicSerieCard from "@/components/profile/PublicSerieCard/PublicSerieCard";

const TABS = [
  { id: "all", label: "All" },
  { id: "watching", label: "Watching" },
  { id: "completed", label: "Completed" },
  { id: "on_hold", label: "On hold" },
  { id: "dropped", label: "Dropped" },
  { id: "plan_to_watch", label: "Plan to watch" },
];

export default function ProfileTrackedSeries({ trackedSeries, progressMap, username }) {
  const [activeTab, setActiveTab] = useState("all");

  const counts = useMemo(() => {
    const c = { all: trackedSeries.length };
    for (const tab of TABS) {
      if (tab.id === "all") continue;
      c[tab.id] = trackedSeries.filter((t) => t.status === tab.id).length;
    }
    return c;
  }, [trackedSeries]);

  const filtered = useMemo(() => {
    if (activeTab === "all") return trackedSeries;
    return trackedSeries.filter((t) => t.status === activeTab);
  }, [trackedSeries, activeTab]);

  if (trackedSeries.length === 0) return null;

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
