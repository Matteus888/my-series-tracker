"use client";

import styles from "./RatingsPopover.module.css";
import Icon from "@mdi/react";
import { mdiStar, mdiStarOutline } from "@mdi/js";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import { useState } from "react";

export default function RatingsPopover({ serie, episode, currentRating, onRate, popoverRef }) {
  const [hoverRating, setHoverRating] = useState(null);
  const { trackedSeries, updateSeries } = useTrackedSeries();

  // Mode épisode : props directes ; mode série : via contexte (legacy)
  const isEpisodeMode = !!episode;

  let userRating;
  let handleRate;

  if (isEpisodeMode) {
    userRating = currentRating ?? null;
    handleRate = (rating) => {
      const newRating = userRating === rating ? null : rating;
      onRate(newRating);
    };
  } else {
    const tracked = trackedSeries.find((s) => s.tmdbId === serie.id);
    userRating = tracked?.rating ?? null;
    handleRate = (rating) => {
      if (!tracked) return;
      const newRating = userRating === rating ? null : rating;
      updateSeries(serie.id, { rating: newRating });
    };
  }

  return (
    <div className={styles.popover} ref={popoverRef}>
      <p className={styles.title}>Your rating</p>
      <div className={styles.stars}>
        {Array.from({ length: 10 }).map((_, i) => {
          const starValue = i + 1;
          const activeRating = hoverRating ?? userRating;
          const isFilled = activeRating !== null && starValue <= activeRating;
          return (
            <span
              key={i}
              className={styles.star}
              onClick={() => handleRate(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(null)}
              title={`${starValue}/10`}
            >
              <Icon
                path={isFilled ? mdiStar : mdiStarOutline}
                size={0.6}
                color={isFilled ? "var(--yellow)" : "var(--foreground)"}
              />
            </span>
          );
        })}
      </div>
      {userRating && <p className={styles.userRatingValue}>{userRating}/10</p>}
    </div>
  );
}
