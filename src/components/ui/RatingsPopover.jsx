"use client";

import styles from "./RatingsPopover.module.css";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import Icon from "@mdi/react";
import { mdiStar, mdiStarOutline } from "@mdi/js";

export default function RatingsPopover({ serie, ratings, popoverRef }) {
  const { trackedSeries, updateSeries } = useTrackedSeries();

  const tracked = trackedSeries.find((s) => s.tmdbId === serie.id);
  const userRating = tracked?.rating ?? null;

  const handleRate = (rating) => {
    if (!tracked) return;
    // Si on reclique sur la même note, on la retire
    const newRating = userRating === rating ? null : rating;
    updateSeries(serie.id, { rating: newRating });
  };

  return (
    <div className={styles.popover} ref={popoverRef}>
      <p className={styles.title}>Ratings</p>
      <div className={styles.scores}>
        {ratings?.tmdb?.score && (
          <div className={styles.scoreRow}>
            <span className={styles.source}>TMDB</span>
            <span className={styles.score}>
              {Math.round(ratings.tmdb.score * 10)}%
              <span className={styles.voteCount}>({ratings.tmdb.voteCount?.toLocaleString()})</span>
            </span>
          </div>
        )}
        {ratings?.imdb?.score && (
          <div className={styles.scoreRow}>
            <span className={styles.source}>IMDB</span>
            <span className={styles.score}>
              {ratings.imdb.score}/10
              <span className={styles.voteCount}>({ratings.imdb.voteCount?.toLocaleString()})</span>
            </span>
          </div>
        )}
      </div>

      {tracked && (
        <>
          <div className={styles.divider} />
          <p className={styles.userRatingTitle}>Your rating</p>
          <div className={styles.stars}>
            {Array.from({ length: 10 }).map((_, i) => {
              const starValue = i + 1;
              const isFilled = userRating !== null && starValue <= userRating;
              return (
                <span key={i} className={styles.star} onClick={() => handleRate(starValue)} title={`${starValue}/10`}>
                  <Icon
                    path={isFilled ? mdiStar : mdiStarOutline}
                    size={0.7}
                    color={isFilled ? "var(--yellow)" : "var(--foreground)"}
                  />
                </span>
              );
            })}
          </div>
          {userRating && <p className={styles.userRatingValue}>{userRating}/10</p>}
        </>
      )}
      {!tracked && (
        <>
          <div className={styles.divider} />
          <p className={styles.notTracked}>Follow this show to rate it</p>
        </>
      )}
    </div>
  );
}
