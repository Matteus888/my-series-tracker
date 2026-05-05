"use client";

import styles from "./SeriePresentationActions.module.css";
import Icon from "@mdi/react";
import { mdiCheck, mdiBookmarkPlusOutline, mdiPlaylistPlus } from "@mdi/js";
import HeartRating from "@/components/ui/HeartRating/HeartRating";

export default function SeriePresentationActions({
  isTracked,
  isFavorite,
  inAnyList,
  score,
  tracked,
  confirmPopover,
  watchlistPopover,
  ratingsPopover,
  onCheck,
  onFavorite,
  onWatchlist,
  onRatings,
}) {
  return (
    <div className={styles.actions}>
      {/* Check */}
      <button
        className={`btn check ${styles.button} ${isTracked || confirmPopover.isOpen ? "active" : ""}`}
        onClick={onCheck}
        title={isTracked ? "Remove from watched" : "Add to watched"}
      >
        <Icon path={mdiCheck} size={1} />
      </button>

      {/* Favorite */}
      <button
        className={`btn bookmark ${styles.button} ${isFavorite ? "active" : ""}`}
        onClick={onFavorite}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Icon path={mdiBookmarkPlusOutline} size={1} />
      </button>

      {/* Watchlist */}
      <button
        className={`btn watchlist ${styles.button} ${inAnyList || watchlistPopover.isOpen ? "active" : ""}`}
        onClick={onWatchlist}
        title={inAnyList ? "Manage list" : "Add to list"}
      >
        <Icon path={mdiPlaylistPlus} size={1} />
      </button>

      {/* Heart rating — coeur seul, même taille que les autres */}
      <button
        className={`btn heartWrapper ${styles.button} ${styles.heart} ${ratingsPopover.isOpen ? "active" : ""}`}
        onClick={onRatings}
        title={tracked?.rating ? `Your rating: ${tracked.rating}/10` : "Rate this show"}
      >
        <HeartRating percentage={score ?? 0} />
        {score > 0 && <span className={styles.rating}>{score}%</span>}
      </button>
    </div>
  );
}
