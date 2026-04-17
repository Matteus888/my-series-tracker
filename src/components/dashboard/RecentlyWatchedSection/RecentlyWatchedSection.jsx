"use client";

import styles from "./RecentlyWatchedSection.module.css";
import { useRecentlyWatched } from "@/hooks/useRecentlyWatched";
import EpisodeCard from "@/components/series/EpisodeCard/EpisodeCard";
import SectionHeader from "../SectionHeader/SectionHeader";

export default function RecentlyWatchedSection() {
  const { items, loading, error, uncheckEpisode } = useRecentlyWatched();

  if (loading) return <SectionSkeleton />;
  if (error) return <p className={styles.error}>Failed to load.</p>;
  if (!items?.length) return null;

  return (
    <section className={styles.section}>
      <SectionHeader title="Recently watched" href="/history" />
      <div className={styles.carousel}>
        {items.map((item) => (
          <div key={item._id} className={styles.cardWrapper}>
            <EpisodeCard ep={item} onToggle={uncheckEpisode} seriesTitle={item.seriesTitle} showSeason />
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionSkeleton() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Recently watched</h2>
      <div className={styles.carousel}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.skeletonContainer}>
            <div className={`card ${styles.skeletonCard}`}>
              <div className={styles.skeletonImage}>
                <div className={styles.skeletonPulse} />
              </div>
              <div className={`card-footer ${styles.skeletonFooter}`}>
                <div className={styles.skeletonLabel} />
                <div className={styles.skeletonButton} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
