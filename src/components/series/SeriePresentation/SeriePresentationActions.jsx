"use client";

import styles from "./SeriePresentationActions.module.css";
import Image from "next/image";
import Icon from "@mdi/react";
import { mdiCheck, mdiBookmarkPlusOutline, mdiPlaylistPlus } from "@mdi/js";
import HeartRating from "@/components/ui/HeartRating/HeartRating";
import RatingBadges from "../RatingBadges/RatingBadges";
import { shouldInvertLogo } from "@/lib/utils/network.utils";

export default function SeriePresentationActions({
  isTracked,
  isFavorite,
  inAnyList,
  score,
  tracked,
  ratings,
  networks = [],
  confirmPopover,
  watchlistPopover,
  ratingsPopover,
  onCheck,
  onFavorite,
  onWatchlist,
  onRatings,
}) {
  const getNetworkUrl = (n) => n.homepage || `https://www.themoviedb.org/network/${n.id}`;

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

      {/* Badges détaillés par source */}
      <div className={styles.badgesWrapper}>
        <RatingBadges ratings={ratings} />
      </div>

      {/* Networks – collés à droite */}
      {networks.length > 0 && (
        <div className={styles.networks}>
          {networks.map((n) =>
            n.logo_path ? (
              <a
                key={n.id}
                href={getNetworkUrl(n)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.networkLink}
                title={`Watch on ${n.name}`}
              >
                <Image
                  src={`https://image.tmdb.org/t/p/w92${n.logo_path}`}
                  alt={n.name}
                  width={92}
                  height={92}
                  className={shouldInvertLogo(n.id) ? styles.networkLogoInverted : ""}
                />
              </a>
            ) : (
              <a
                key={n.id}
                href={`https://www.themoviedb.org/network/${n.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.networkLinkText}
                title={`Watch on ${n.name}`}
              >
                {n.name}
              </a>
            ),
          )}
        </div>
      )}
    </div>
  );
}
