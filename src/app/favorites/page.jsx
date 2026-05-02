"use client";

import styles from "./page.module.css";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import { normalizeSerieData } from "@/lib/utils/serie.utils";
import SerieCard from "@/components/series/SerieCard/SerieCard";
import SerieCardSkeleton from "@/components/series/SerieCardSkeleton/SerieCardSkeleton";
import PageTitle from "@/components/ui/PageTitle/PageTitle";
import FavoritesHeader from "@/components/favorites/FavoritesHeader/FavoritesHeader";
import EmptyStateCard from "@/components/series/EmptyStateCard/EmptyStateCard";
import { mdiBookmarkPlusOutline } from "@mdi/js";

const SKELETON_COUNT = 12;

export default function FavoritesPage() {
  const { trackedSeries, isLoading } = useTrackedSeries();

  const favorites = trackedSeries.filter((s) => s.isFavorite);

  return (
    <div className={styles.page}>
      <PageTitle title="Favorites" icon={mdiBookmarkPlusOutline} />
      <FavoritesHeader favorites={favorites} isLoading={isLoading} />

      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SerieCardSkeleton key={i} />
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className={styles.grid}>
          {favorites.map((tracked) => {
            const normalized = normalizeSerieData(tracked);
            if (!normalized) return null;
            return <SerieCard key={tracked.tmdbId} serie={normalized} score={normalized.score} />;
          })}
        </div>
      ) : (
        <EmptyStateCard
          icon={mdiBookmarkPlusOutline}
          label="No favorites yet"
          subtitle="Click the bookmark icon on a show to add it here"
        />
      )}
    </div>
  );
}
