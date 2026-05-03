"use client";

import styles from "./page.module.css";
import { useList } from "@/context/ListContext";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";
import { useStartWatching } from "@/hooks/useStartWatching";
import PageTitle from "@/components/ui/PageTitle/PageTitle";
import StartWatchingCard from "@/components/dashboard/StartWatchingCard/StartWatchingCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import PageLoader from "@/components/ui/PageLoader/PageLoader";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";
import ListsHeader from "@/components/lists/ListsHeader/ListsHeader";
import EmptyStateCard from "@/components/series/EmptyStateCard/EmptyStateCard";
import ListActions from "@/components/lists/ListActions/ListActions";
import { mdiPlaylistPlus, mdiPlaylistRemove, mdiBookmarkOutline } from "@mdi/js";

export default function ListsPage() {
  const { lists, watchlist, isLoading: listsLoading } = useList();
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();
  const { checkFirstEpisode, checkingId } = useStartWatching();

  const customLists = lists.filter((l) => !l.isDefault);
  const watchlistSeries = watchlist?.series ?? [];

  if (listsLoading)
    return (
      <div className={styles.page}>
        <PageTitle title="Lists" icon={mdiPlaylistPlus} />
        <ListsHeader lists={lists} isLoading={listsLoading} />
        <PageLoader />
      </div>
    );

  return (
    <div className={styles.page}>
      <PageTitle title="Lists" icon={mdiPlaylistPlus} />
      <ListsHeader lists={lists} isLoading={listsLoading} />
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
              <EmptyStateCard
                icon={mdiBookmarkOutline}
                label="Your watchlist is empty"
                subtitle="Bookmark shows you want to watch later"
              />
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
          actions={<ListActions list={list} />}
        >
          <div className={styles.carouselWrapper}>
            <div className={styles.carousel} ref={scrollerRef}>
              {list.series.length === 0 ? (
                <EmptyStateCard
                  icon={mdiPlaylistRemove}
                  label="This list is empty"
                  subtitle="Add series from the search or browse pages"
                />
              ) : (
                list.series.map((serie) => {
                  const item = {
                    seriesId: serie._id?.toString(),
                    tmdbId: serie.tmdbId,
                    title: serie.title,
                    posterPath: serie.posterPath ?? null,
                  };
                  return (
                    <StartWatchingCard
                      key={item.seriesId}
                      item={item}
                      showCheck={true}
                      onCheck={checkFirstEpisode}
                      isChecking={checkingId === item.seriesId}
                    />
                  );
                })
              )}
            </div>
            <CarouselArrows canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scrollBy} />
          </div>
        </SectionHeader>
      ))}
      {customLists.length === 0 && (
        <EmptyStateCard
          icon={mdiPlaylistPlus}
          label="No custom lists yet"
          subtitle="Create your first list to organize your shows by theme or mood"
        />
      )}
    </div>
  );
}
