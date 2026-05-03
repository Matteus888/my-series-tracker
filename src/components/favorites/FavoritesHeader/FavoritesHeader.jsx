"use client";

import styles from "./FavoritesHeader.module.css";
import { computeAverageScore } from "@/lib/utils/ratings.utils";
import Icon from "@mdi/react";
import { mdiLoading } from "@mdi/js";

export default function FavoritesHeader({ favorites, isLoading = false }) {
  const favoritesCount = favorites.length;

  // Score moyen
  const scores = favorites.map((tracked) => computeAverageScore(tracked.seriesId?.ratings)).filter((s) => s !== null);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : null;

  // Top genre
  const genreCount = new Map();
  for (const tracked of favorites) {
    const genres = tracked.seriesId?.genres ?? [];
    for (const genre of genres) {
      genreCount.set(genre, (genreCount.get(genre) ?? 0) + 1);
    }
  }
  let topGenre = null;
  let topGenreCount = 0;
  for (const [genre, count] of genreCount) {
    if (count > topGenreCount) {
      topGenre = genre;
      topGenreCount = count;
    }
  }

  // Force le loading tant que le composant n'est pas monté côté client
  // const showLoading = !mounted || isLoading;

  return (
    <section className={styles.wrapper}>
      <div className={styles.title}>
        <h2 className={styles.heading}>Your favorites</h2>
        <p className={styles.subtitle}>The series you love the most</p>
      </div>

      <div className={styles.stats}>
        <Stat label="Favorites" value={favoritesCount} isLoading={isLoading} />
        <Stat label="Avg score" value={avgScore !== null ? avgScore : "—"} isLoading={isLoading} />
        <Stat label="Top genre" value={topGenre ?? "—"} isLoading={isLoading} />
      </div>
    </section>
  );
}

function Stat({ label, value, isLoading }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>
        {isLoading ? <Icon path={mdiLoading} size={0.9} className={styles.spinner} /> : value}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
