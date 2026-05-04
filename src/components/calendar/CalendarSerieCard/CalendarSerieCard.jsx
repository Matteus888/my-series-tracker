"use client";

import styles from "./CalendarSerieCard.module.css";
import Image from "next/image";
import Link from "next/link";
import HeartRating from "@/components/ui/HeartRating/HeartRating";
import { formatDuration } from "@/lib/utils/duration.utils";
import { formatEpisodeLabel } from "@/lib/utils/episode.utils";

export default function CalendarSerieCard({ episode }) {
  const { tmdbId, seriesTitle, posterPath, networks, seasonNumber, episodes, isFullSeason, seasonEpisodeCount } =
    episode;

  const network = networks?.[0];
  const isSingle = episodes.length === 1;

  // Code épisode formaté
  const seasonCode = `S${String(seasonNumber).padStart(2, "0")}`;
  const epLabel = formatEpisodeLabel(episodes);
  const episodeCode = isFullSeason ? `Season ${seasonNumber} · Full release` : `${seasonCode} ${epLabel}`;
  const firstEp = episodes[0];

  // Badge premiere/finale (uniquement quand 1 seul épisode pertinent)
  let badge = null;
  if (isSingle) {
    if (firstEp.episodeNumber === 1) {
      badge = { label: "Premiere", className: styles.badgePremiere };
    } else if (seasonEpisodeCount && firstEp.episodeNumber === seasonEpisodeCount) {
      badge = { label: "Finale", className: styles.badgeFinale };
    }
  } else if (isFullSeason) {
    badge = { label: "Full season", className: styles.badgePremiere };
  }

  // Note : toujours celle du 1er épisode
  const tmdbScore = firstEp.ratings?.tmdb?.score;
  const ratingPercent = typeof tmdbScore === "number" ? Math.round(tmdbScore * 10) : null;

  // Durée : 1 ép → la sienne ; multi → somme
  const duration = isSingle ? firstEp.duration : episodes.reduce((sum, e) => sum + (e.duration ?? 0), 0) || null;

  // Overview : toujours celle du 1er épisode
  const overview = firstEp.overview;

  // Titre : seulement quand 1 seul épisode (sinon ambigu)
  const episodeTitle = isSingle ? firstEp.title : null;

  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.posterSection}>
        <Link href={`/series/${tmdbId}`} className={styles.posterLink}>
          {posterPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w185${posterPath}`}
              alt={seriesTitle}
              fill
              loading="eager"
              sizes="(max-width: 768px) 40vw, 146px"
              className={styles.poster}
            />
          ) : (
            <div className={styles.posterPlaceholder}>{seriesTitle}</div>
          )}
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          {badge && <span className={`${styles.badge} ${badge.className}`}>{badge.label}</span>}
          <Link href={`/series/${tmdbId}`} className={styles.titleLink}>
            <h3 className={styles.title}>{seriesTitle}</h3>
          </Link>
          <div className={styles.episodeInfo}>
            {episodeCode}
            {episodeTitle && ` · ${episodeTitle}`}
            {!isSingle && !isFullSeason && ` · ${episodes.length} new episodes`}
          </div>
        </div>

        {overview && <p className={styles.overview}>{overview}</p>}

        <div className={styles.meta}>
          <span className={styles.metaNetwork}>
            {network?.logoPath && (
              <Image
                src={`https://image.tmdb.org/t/p/w92${network.logoPath}`}
                alt={network.name}
                width={40}
                height={16}
                loading="eager"
                className={styles.networkLogo}
              />
            )}
          </span>

          <span className={styles.metaDuration}>{duration > 0 && formatDuration(duration)}</span>

          <span className={styles.metaRating}>
            {ratingPercent !== null && (
              <>
                <span className={styles.heartWrapper}>
                  <HeartRating percentage={ratingPercent} />
                </span>
                {ratingPercent}%
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
