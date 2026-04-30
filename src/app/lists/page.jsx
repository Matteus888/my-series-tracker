"use client";

import styles from "./page.module.css";
import { useList } from "@/context/ListContext";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";
import PageTitle from "@/components/ui/PageTitle/PageTitle";
import StartWatchingCard from "@/components/dashboard/StartWatchingCard/StartWatchingCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import PageLoader from "@/components/ui/PageLoader/PageLoader";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";
import ListsHeader from "@/components/lists/ListsHeader/ListsHeader";
import { mdiPlaylistPlus } from "@mdi/js";

export default function ListsPage() {
  const { lists, watchlist, isLoading: listsLoading } = useList();
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();

  const customLists = lists.filter((l) => !l.isDefault);
  const watchlistSeries = watchlist?.series ?? [];

  if (listsLoading)
    return (
      <div className={styles.page}>
        <PageTitle title="Lists" icon={mdiPlaylistPlus} />
        <PageLoader />
      </div>
    );

  return (
    <div className={styles.page}>
      <PageTitle title="Lists" icon={mdiPlaylistPlus} />
      <ListsHeader lists={lists} />
      {/* Plan to Watch */}
      <SectionHeader title="Plan to watch" storageKey="section-list-plan-to-watch">
        <div className={styles.carouselWrapper}>
          <div className={styles.carousel} ref={scrollerRef}>
            {listsLoading ? (
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
            ) : watchlistSeries.length === 0 ? (
              <p className={styles.empty}>No series in your watchlist.</p>
            ) : (
              watchlistSeries.map((serie) => {
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
          <CarouselArrows canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scrollBy} />
        </div>
      </SectionHeader>

      {/* Listes custom */}
      {customLists.map((list) => (
        <SectionHeader
          key={list._id}
          title={`${list.name} (${list.series.length})`}
          storageKey={`section-list-${list._id}`}
        >
          <div className={styles.carouselWrapper}>
            <div className={styles.carousel} ref={scrollerRef}>
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
            <CarouselArrows canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scrollBy} />
          </div>
        </SectionHeader>
      ))}
    </div>
  );
}
