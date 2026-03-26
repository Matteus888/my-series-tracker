"use client";

import styles from "./page.module.css";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import { normalizeSerieData } from "@/lib/utils/serie.utils";
import SerieCard from "@/components/series/SerieCard";
import SerieCardSkeleton from "@/components/series/SerieCardSkeleton";

export default function FavoritesPage() {
  const { trackedSeries, isLoading } = useTrackedSeries();

  const favorites = trackedSeries.filter((s) => s.isFavorite);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Favorites</h1>
      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: favorites.length }).map((_, i) => (
            <SerieCardSkeleton key={i} />
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className={styles.grid}>
          {favorites.map((tracked) => (
            <SerieCard key={tracked.tmdbId} serie={normalizeSerieData(tracked)} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>No favorites yet. Click the bookmark icon on a show to add it here.</p>
      )}
    </div>
  );
}
