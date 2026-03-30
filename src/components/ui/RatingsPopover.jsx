"use client";

import styles from "./RatingsPopover.module.css";
import Icon from "@mdi/react";
import { mdiStar, mdiStarOutline } from "@mdi/js";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function RatingsPopover({ serie, popoverRef }) {
  const { trackedSeries, updateSeries } = useTrackedSeries();
  const { isAuthenticated } = useAuthGuard();

  const tracked = trackedSeries.find((s) => s.tmdbId === serie.id);
  const userRating = tracked?.rating ?? null;

  const handleRate = (rating) => {
    if (!tracked) return;
    // Si on reclique sur la même note, on la retire
    const newRating = userRating === rating ? null : rating;
    updateSeries(serie.id, { rating: newRating });
  };

  console.log(
    "find result:",
    trackedSeries.find((s) => s.tmdbId === serie.id),
  );
  console.log("manual check:", trackedSeries[0].tmdbId === serie.id, trackedSeries[0].tmdbId, serie.id);

  return (
    <div className={styles.popover} ref={popoverRef}>
      {!isAuthenticated ? (
        <p className={styles.message}>Log in to rate this show</p>
      ) : !tracked ? (
        <p className={styles.message}>Follow this show to rate it</p>
      ) : (
        <>
          <p className={styles.title}>Your rating</p>
          <div className={styles.stars}>
            {Array.from({ length: 10 }).map((_, i) => {
              const starValue = i + 1;
              const isFilled = userRating !== null && starValue <= userRating;
              return (
                <span key={i} className={styles.star} onClick={() => handleRate(starValue)} title={`${starValue}/10`}>
                  <Icon
                    path={isFilled ? mdiStar : mdiStarOutline}
                    size={0.6}
                    color={isFilled ? "var(--yellow)" : "var(--background-secondary)"}
                  />
                </span>
              );
            })}
          </div>
          {userRating && <p className={styles.userRatingValue}>{userRating}/10</p>}
        </>
      )}
    </div>
  );
}
