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
import CreateListButton from "@/components/lists/CreateListButton/CreateListButton";
import Icon from "@mdi/react";
import {
  mdiPlaylistPlus,
  mdiPlaylistRemove,
  mdiBookmarkOutline,
  mdiEarth,
  mdiLockOutline,
  mdiTelevision,
  mdiMagnify,
} from "@mdi/js";

export default function ListsPage() {
  const { lists, watchlist, isLoading: listsLoading } = useList();
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();
  const { checkFirstEpisode, checkingId } = useStartWatching();

  const customLists = lists.filter((l) => !l.isDefault);
  const watchlistSeries = watchlist?.series ?? [];

  if (listsLoading) {
    return (
      <div className={styles.page}>
        <PageTitle title="Lists" icon={mdiPlaylistPlus} />
        <ListsHeader lists={lists} isLoading={listsLoading} />
        <PageLoader />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageTitle title="Lists" icon={mdiPlaylistPlus} />
      <ListsHeader lists={lists} isLoading={listsLoading} />

      {/* Plan to Watch */}
      <div className={styles.listSection}>
        <SectionHeader
          title={
            <>
              Plan to watch <span className={styles.listCount}>({watchlistSeries.length})</span>
            </>
          }
          storageKey="section-list-plan-to-watch"
        >
          <div className={styles.carouselWrapper}>
            <div className={styles.carousel} ref={scrollerRef}>
              {watchlistSeries.length === 0 ? (
                <EmptyStateCard
                  icon={mdiBookmarkOutline}
                  label="Your watchlist is empty"
                  subtitle="Bookmark shows to watch later"
                  links={[
                    { href: "/series", label: "Browse", icon: mdiTelevision },
                    { href: "/search", label: "Search", icon: mdiMagnify },
                  ]}
                  inCarousel
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
        <p className={styles.listDescription}>Default</p>
      </div>

      {/* Listes custom */}
      {customLists.map((list) => (
        <div key={list._id} className={styles.listSection}>
          <SectionHeader
            title={
              <>
                {list.name}
                <Icon
                  path={list.isPublic ? mdiEarth : mdiLockOutline}
                  size={0.6}
                  className={`${styles.visibilityIcon} ${list.isPublic ? styles.visibilityPublic : ""}`}
                />
                <span className={styles.listCount}>({list.series.length})</span>
              </>
            }
            storageKey={`section-list-${list._id}`}
            actions={<ListActions list={list} />}
          >
            <div className={styles.carouselWrapper}>
              <div className={styles.carousel} ref={scrollerRef}>
                {list.series.length === 0 ? (
                  <EmptyStateCard
                    icon={mdiPlaylistRemove}
                    label="This list is empty"
                    subtitle="Find series to add"
                    links={[
                      { href: "/series", label: "Browse", icon: mdiTelevision },
                      { href: "/search", label: "Search", icon: mdiMagnify },
                    ]}
                    inCarousel
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
          {list.description && <p className={styles.listDescription}>{list.description}</p>}
        </div>
      ))}

      {customLists.length === 0 && (
        <div className={styles.noListsEmpty}>
          <EmptyStateCard
            icon={mdiPlaylistPlus}
            label="No custom lists yet"
            subtitle="Create your first list to organize your shows by theme or mood"
            action={<CreateListButton variant="ghost" popoverAlign="left" popoverPosition="top" />}
          />
        </div>
      )}
    </div>
  );
}
