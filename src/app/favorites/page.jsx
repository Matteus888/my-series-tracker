"use client";

import styles from "./page.module.css";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import { normalizeSerieData } from "@/lib/utils/serie.utils";
import SerieCard from "@/components/series/SerieCard/SerieCard";
import PageTitle from "@/components/ui/PageTitle/PageTitle";
import PageLoader from "@/components/ui/PageLoader/PageLoader";
import FavoritesHeader from "@/components/favorites/FavoritesHeader/FavoritesHeader";
import EmptyStateCard from "@/components/series/EmptyStateCard/EmptyStateCard";
import { mdiBookmarkPlusOutline } from "@mdi/js";

export default function FavoritesPage() {
  const { trackedSeries, isLoading } = useTrackedSeries();

  const favorites = trackedSeries.filter((s) => s.isFavorite);

  return (
    <div className={styles.page}>
      <PageTitle title="Favorites" icon={mdiBookmarkPlusOutline} />
      <FavoritesHeader favorites={favorites} isLoading={isLoading} />

      {isLoading ? (
        <PageLoader />
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
