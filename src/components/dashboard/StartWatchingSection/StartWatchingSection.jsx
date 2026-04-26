"use client";

import styles from "./StartWatchingSection.module.css";
import { useStartWatching } from "@/hooks/useStartWatching";
import StartWatchingCard from "@/components/dashboard/StartWatchingCard/StartWatchingCard";
import SectionHeader from "../SectionHeader/SectionHeader";
import SectionEmptyState from "../SectionEmptyState/SectionEmptyState";
import { mdiPlaylistPlus } from "@mdi/js";

export default function StartWatchingSection() {
  const { items, loading, error, checkFirstEpisode, checkingId } = useStartWatching();

  if (error) return <p className={styles.error}>Failed to load.</p>;

  const isEmpty = !loading && (!items || items.length === 0);

  return (
    <section className={styles.section}>
      <SectionHeader
        title="Start watching"
        href={isEmpty ? undefined : "/lists"}
        storageKey="section-start-watching"
        defaultOpen={true}
      >
        {loading ? (
          <div className={styles.carousel}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonContainer}>
                <div className={`card ${styles.skeletonCard}`}>
                  <div className={styles.skeletonImage}>
                    <div className={styles.skeletonPulse} />
                  </div>
                  <div className={styles.skeletonFooter}>
                    <div className={styles.skeletonButton} />
                    <div className={styles.skeletonButton} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <SectionEmptyState
            icon={mdiPlaylistPlus}
            message="Add shows to your watchlist and pick one up whenever you're ready to start a new series."
            ctaLabel="Discover shows"
            ctaHref="/series"
          />
        ) : (
          <div className={styles.carousel}>
            {items.map((item) => (
              <StartWatchingCard
                key={item.seriesId}
                item={item}
                onCheck={checkFirstEpisode}
                isChecking={checkingId === item.seriesId}
                showCheck
              />
            ))}
          </div>
        )}
      </SectionHeader>
    </section>
  );
}
