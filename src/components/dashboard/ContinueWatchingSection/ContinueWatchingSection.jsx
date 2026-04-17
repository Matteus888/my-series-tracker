"use client";

import styles from "./ContinueWatchingSection.module.css";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import ContinueWatchingCard from "@/components/dashboard/ContinueWatchingCard/ContinueWatchingCard";
import SectionHeader from "../SectionHeader/SectionHeader";

export default function ContinueWatchingSection() {
  const { items, loading, error, checkEpisode } = useContinueWatching();

  if (loading) return <SectionSkeleton />;
  if (error) return <p className={styles.error}>Failed to load.</p>;
  if (items.length === 0) return null;

  return (
    <section className={styles.section}>
      <SectionHeader title="Continue watching" href="/watching" />
      <div className={styles.carousel}>
        {items.map((item) => (
          <ContinueWatchingCard key={item.seriesId} item={item} onCheck={checkEpisode} />
        ))}
      </div>
    </section>
  );
}

function SectionSkeleton() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Continue watching</h2>
      <div className={styles.carousel}>
        {Array.from({ length: 6 }).map((_, i) => (
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
