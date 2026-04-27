"use client";

import styles from "./RecentlyWatchedSection.module.css";
import { useRecentlyWatched } from "@/hooks/useRecentlyWatched";
import EpisodeCard from "@/components/series/EpisodeCard/EpisodeCard";
import SectionHeader from "../SectionHeader/SectionHeader";
import SectionEmptyState from "../SectionEmptyState/SectionEmptyState";
import { mdiHistory } from "@mdi/js";

export default function RecentlyWatchedSection() {
  const { items, loading, error, uncheckEpisode } = useRecentlyWatched();

  if (error) return <p className={styles.error}>Failed to load.</p>;

  const isEmpty = !loading && !items?.length;

  return (
    <section className={styles.section}>
      <SectionHeader
        title="Recently watched"
        href={isEmpty ? undefined : "/history"}
        icon={mdiHistory}
        storageKey="section-recently-watched"
        defaultOpen={true}
        hasContent={items.length > 0}
      >
        {loading ? (
          <div className={styles.carousel}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.skeletonContainer}>
                <div className={`card ${styles.skeletonCard}`}>
                  <div className={styles.skeletonImage}>
                    <div className={styles.skeletonPulse} />
                  </div>
                  <div className={styles.skeletonFooter}>
                    <div className={styles.skeletonLabel} />
                    <div className={styles.skeletonButton} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <SectionEmptyState
            icon={mdiHistory}
            message="Check off episodes as you watch them to build your history and keep track of where you left off."
            ctaLabel="Browse series"
            ctaHref="/series"
          />
        ) : (
          <div className={styles.carousel}>
            {items.map((item) => (
              <div key={item._id} className={styles.cardWrapper}>
                <EpisodeCard ep={item} onToggle={uncheckEpisode} seriesTitle={item.seriesTitle} showSeason />
              </div>
            ))}
          </div>
        )}
      </SectionHeader>
    </section>
  );
}
