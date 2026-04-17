"use client";

import styles from "./ProgressCard.module.css";
import Image from "next/image";
import Link from "next/link";
import Icon from "@mdi/react";
import { mdiCheck } from "@mdi/js";
import { formatDuration } from "@/lib/utils/duration.utils";

export default function ProgressCard({ item, onCheck }) {
  const {
    tmdbId,
    title,
    posterPath,
    watchedCount,
    totalCount,
    remainingCount,
    totalRemainingDuration,
    nextEpisode,
  } = item;

  const progressPercent = Math.round((watchedCount / totalCount) * 100);

  const episodeLabel = nextEpisode
    ? `S${String(nextEpisode.seasonNumber).padStart(2, "0")}E${String(nextEpisode.episodeNumber).padStart(2, "0")}`
    : null;

  return (
    <div className={`tooltip-wrapper ${styles.container}`}>
      <div className="tooltip">{title}</div>
      <div className={`card ${styles.card}`}>

        {/* Poster gauche */}
        <div className={styles.posterSection}>
          <Link href={`/series/${tmdbId}`} className={styles.posterLink}>
            {posterPath ? (
              <Image
                src={`https://image.tmdb.org/t/p/w185${posterPath}`}
                alt={title}
                fill
                sizes="95px"
                className={styles.poster}
              />
            ) : (
              <div className={styles.posterPlaceholder}>{title}</div>
            )}
          </Link>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Contenu droite */}
        <div className={styles.content}>
          <Link href={`/series/${tmdbId}`} className={styles.titleLink}>
            <h3 className={styles.title}>{title}</h3>
          </Link>

          {episodeLabel && (
            <p className={styles.nextEpisode}>
              <span className={styles.epCode}>{episodeLabel}</span>
              {nextEpisode.title && (
                <span className={styles.epTitle}> — {nextEpisode.title}</span>
              )}
            </p>
          )}

          <div className={styles.stats}>
            {nextEpisode?.duration && (
              <span className={styles.stat}>
                {formatDuration(nextEpisode.duration)}
              </span>
            )}
            {remainingCount > 0 && (
              <span className={styles.stat}>
                {remainingCount} remaining
              </span>
            )}
            {totalRemainingDuration > 0 && (
              <span className={styles.stat}>
                {formatDuration(totalRemainingDuration)} left
              </span>
            )}
          </div>

          <button
            className={`btn check ${styles.checkButton}`}
            onClick={() => onCheck(item.seriesId, nextEpisode?._id)}
            disabled={!nextEpisode}
            title={episodeLabel ? `Mark ${episodeLabel} as watched` : "No next episode"}
          >
            <Icon path={mdiCheck} size={0.9} />
          </button>
        </div>

      </div>
    </div>
  );
}
