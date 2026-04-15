"use client";

import styles from "./ContinueWatchingSection.module.css";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import ContinueWatchingCard from "@/components/dashboard/ContinueWatchingCard/ContinueWatchingCard";

export default function ContinueWatchingSection() {
  const { items, loading, error, checkEpisode } = useContinueWatching();

  if (loading) return <SectionSkeleton />;
  if (error)   return <p className={styles.error}>Failed to load.</p>;
  if (items.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Continue watching</h2>
      <div className={styles.carousel}>
        {items.map((item) => (
          <ContinueWatchingCard
            key={item.seriesId}
            item={item}
            onCheck={checkEpisode}
          />
        ))}
      </div>
    </section>
  );
}

function SectionSkeleton() {
  return (
    <section style={{ marginBottom: "2.5rem" }}>
      <div style={{ width: 180, height: 22, background: "var(--background-third)", borderRadius: 4, marginBottom: "1rem" }} />
      <div style={{ display: "flex", gap: "0.75rem" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 150,
              aspectRatio: "2/3",
              background: "var(--background-third)",
              borderRadius: 4,
              animation: "pulse 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </section>
  );
}
