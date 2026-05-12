"use client";

import styles from "./SerieCard.module.css";
import Link from "next/link";
import Image from "next/image";
import { useSerieCard } from "@/hooks/useSerieCard";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import SerieCardPopovers from "./SerieCardPopovers";
import SerieCardActions from "./SerieCardActions";

export default function SerieCard({ serie, onCheck, width = null }) {
  const {
    isTracked,
    isFavorite,
    tracked,
    isDropped,
    score,
    inAnyList,
    confirmPopover,
    watchlistPopover,
    ratingsPopover,
    handleCheck,
    handleConfirm,
    handleFavorite,
    handleWatchlist,
    handleRatings,
  } = useSerieCard(serie, onCheck);

  const { progressMap } = useTrackedSeries();
  const progress = progressMap?.[String(serie.id)];

  return (
    <div
      className={`tooltip-wrapper ${styles.container}`}
      style={width ? { width, minWidth: width, flex: `0 0 ${width}px` } : undefined}
    >
      {/* Tooltip */}
      <div className="tooltip">{serie.name}</div>
      <div className={`card ${styles.card}`}>
        {/* Image */}
        <div className={styles.imageContainer}>
          {/* Popovers */}
          <SerieCardPopovers
            serie={serie}
            isTracked={isTracked}
            isDropped={isDropped}
            confirmPopover={confirmPopover}
            watchlistPopover={watchlistPopover}
            ratingsPopover={ratingsPopover}
            onConfirm={handleConfirm}
          />
          <Link href={`/series/${serie.id}`} className={styles.imageLink}>
            {serie.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${serie.poster_path}`}
                alt={serie.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={styles.image}
                priority={true}
              />
            ) : (
              <div className={styles.placeholderContainer}>{serie.name}</div>
            )}
          </Link>

          {/* Barre de progression */}
          {progress?.totalCount > 0 && (
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.round((progress.watchedCount / progress.totalCount) * 100)}%` }}
              />
            </div>
          )}
          {/* Badge année */}
          {serie.first_air_date && <span className={styles.yearBadge}>{serie.first_air_date.slice(0, 4)}</span>}
          {/* Badge stop */}
          {tracked?.status === "dropped" && <span className={styles.stoppedBadge}>Stopped</span>}
        </div>
        {/* Footer */}
        <div className={`card-footer ${styles.footer}`}>
          <SerieCardActions
            isTracked={isTracked}
            isFavorite={isFavorite}
            inAnyList={inAnyList}
            score={score}
            tracked={tracked}
            confirmPopover={confirmPopover}
            watchlistPopover={watchlistPopover}
            ratingsPopover={ratingsPopover}
            onCheck={handleCheck}
            onFavorite={handleFavorite}
            onWatchlist={handleWatchlist}
            onRatings={handleRatings}
          />
        </div>
      </div>
    </div>
  );
}
