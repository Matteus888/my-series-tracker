"use client";

import styles from "./ProgressCard.module.css";
import Image from "next/image";
import Link from "next/link";
import Icon from "@mdi/react";
import { mdiCheck } from "@mdi/js";
import { formatDuration } from "@/lib/utils/duration.utils";

export default function ProgressCard({ item, onCheck, compact = false }) {
  const {
    tmdbId,
    title,
    posterPath,
    watchedCount,
    totalCount,
    remainingCount,
    totalRemainingDuration,
    nextEpisode,
    networks,
  } = item;

  const progressPercent = Math.round((watchedCount / totalCount) * 100);

  const episodeLabel = nextEpisode
    ? `S${String(nextEpisode.seasonNumber).padStart(2, "0")}E${String(nextEpisode.episodeNumber).padStart(2, "0")}`
    : null;

  return (
    <div className={`card ${styles.card}`}>
      {/* Poster gauche */}
      <div className={styles.posterSection}>
        <Link href={`/series/${tmdbId}`} className={styles.posterLink}>
          {posterPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w185${posterPath}`}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={styles.poster}
            />
          ) : (
            <div className={styles.posterPlaceholder}>{title}</div>
          )}
        </Link>
        {!compact && (
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
        )}
      </div>

      {/* Contenu droite */}
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <Link href={`/series/${tmdbId}`} className={styles.titleLink}>
            <h3 className={styles.title}>{title}</h3>
          </Link>

          {!compact ? (
            <div className={styles.stats}>
              {remainingCount > 0 && (
                <span className={styles.stat}>
                  {remainingCount} episode{remainingCount > 1 && "s"} remaining
                </span>
              )}
              {totalRemainingDuration > 0 && (
                <span className={styles.stat}>{formatDuration(totalRemainingDuration)} left</span>
              )}
            </div>
          ) : (
            nextEpisode?.seasonNumber &&
            item.seasonEpisodeCount && (
              <span className={styles.stat}>
                Season {nextEpisode.seasonNumber} · {item.seasonEpisodeCount} episodes
              </span>
            )
          )}
        </div>
        <div className={styles.divider} />
        <div className={styles.nextEpisodeWrapper}>
          <div className={styles.nextEpisodeContent}>
            {episodeLabel && (
              <p className={styles.nextEpisode}>
                {nextEpisode.title && <span className={styles.epTitle}>{nextEpisode.title}</span>}
                <span className={styles.epCode}>{episodeLabel}</span>
                {nextEpisode?.duration && <span className={styles.stat}>{formatDuration(nextEpisode.duration)}</span>}
              </p>
            )}
            {compact && networks?.[0] && (
              <div className={styles.network}>
                {networks[0].logoPath && (
                  <Image
                    src={`https://image.tmdb.org/t/p/w92${networks[0].logoPath}`}
                    alt={networks[0].name}
                    width={40}
                    height={40}
                    loading="eager"
                    className={styles.networkLogo}
                  />
                )}
              </div>
            )}
          </div>

          {onCheck && (
            <button
              className={`btn check ${styles.checkButton}`}
              onClick={() => onCheck(item.seriesId, nextEpisode?._id)}
              disabled={!nextEpisode}
              title={episodeLabel ? `Mark ${episodeLabel} as watched` : "No next episode"}
            >
              <Icon path={mdiCheck} size={1} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
