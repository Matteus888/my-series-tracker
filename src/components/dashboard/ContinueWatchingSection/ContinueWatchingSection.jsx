"use client";

import styles from "./ContinueWatchingSection.module.css";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import ContinueWatchingCard from "@/components/dashboard/ContinueWatchingCard/ContinueWatchingCard";
import SectionHeader from "../SectionHeader/SectionHeader";

export default function ContinueWatchingSection() {
  const { items, loading, error, checkEpisode } = useContinueWatching();

  if (error) return <p className={styles.error}>Failed to load.</p>;
  if (!loading && items.length === 0) return null;

  return (
    <section className={styles.section}>
      <SectionHeader title="Continue watching" href="/watching" storageKey="section-continue-watching">
        {loading ? (
          <div className={styles.carousel}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonContainer}>
                <div className={`card ${styles.skeletonCard}`}>
                  <div className={styles.skeletonImage}>
                    <div className={styles.skeletonPulse} />
                  </div>
                  <div className={`card-footer ${styles.skeletonFooter}`}>
                    <div className={styles.skeletonButton} />
                    <div className={styles.skeletonText}>
                      <div className={styles.skeletonLabel} />
                      <div className={styles.skeletonLabel} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.carousel}>
            {items.map((item) => (
              <ContinueWatchingCard key={item.seriesId} item={item} onCheck={checkEpisode} />
            ))}
          </div>
        )}
      </SectionHeader>
    </section>
  );
}
