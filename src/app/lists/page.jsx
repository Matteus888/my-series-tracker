"use client";

import styles from "./page.module.css";
import { useList } from "@/context/ListContext";
import { useStartWatching } from "@/hooks/useStartWatching";
import PageTitle from "@/components/ui/PageTitle/PageTitle";
import StartWatchingCard from "@/components/dashboard/StartWatchingCard/StartWatchingCard";
import SectionHeader from "@/components/dashboard/SectionHeader/SectionHeader";
import PageLoader from "@/components/ui/PageLoader/PageLoader";

export default function ListsPage() {
  const { lists, isLoading: listsLoading } = useList();
  const { items, loading, checkFirstEpisode, checkingId } = useStartWatching();

  const customLists = lists.filter((l) => !l.isDefault);

  if (listsLoading)
    return (
      <div className={styles.page}>
        <PageTitle title="Lists" />
        <PageLoader />
      </div>
    );

  return (
    <div className={styles.page}>
      <PageTitle title="Lists" />
      {/* Plan to Watch */}
      <SectionHeader title="Plan to watch">
        <div className={styles.carousel}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.skeletonContainer}>
                <div className={`card ${styles.skeletonCard}`}>
                  <div className={styles.skeletonImage}>
                    <div className={styles.skeletonPulse} />
                  </div>
                  <div className={`card-footer ${styles.skeletonFooter}`}>
                    <div className={styles.skeletonButton} />
                    <div className={styles.skeletonButton} />
                  </div>
                </div>
              </div>
            ))
          ) : items.length === 0 ? (
            <p className={styles.empty}>No series in your watchlist.</p>
          ) : (
            items.map((item) => (
              <StartWatchingCard
                key={item.seriesId}
                item={item}
                onCheck={checkFirstEpisode}
                isChecking={checkingId === item.seriesId}
                showCheck
              />
            ))
          )}
        </div>
      </SectionHeader>

      {/* Listes custom */}
      {customLists.map((list) => (
        <SectionHeader key={list._id} title={`${list.name} (${list.series.length})`}>
          <div className={styles.carousel}>
            {list.series.length === 0 ? (
              <p className={styles.empty}>No series in this list.</p>
            ) : (
              list.series.map((serie) => {
                const item = {
                  seriesId: serie._id?.toString(),
                  tmdbId: serie.tmdbId,
                  title: serie.title,
                  posterPath: serie.posterPath ?? null,
                };
                return <StartWatchingCard key={item.seriesId} item={item} showCheck={false} />;
              })
            )}
          </div>
        </SectionHeader>
      ))}
    </div>
  );
}
