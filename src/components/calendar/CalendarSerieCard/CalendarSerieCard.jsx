"use client";

import styles from "./CalendarSerieCard.module.css";
import Image from "next/image";
import Link from "next/link";
import HeartRating from "@/components/ui/HeartRating/HeartRating";
import { formatDuration } from "@/lib/utils/duration.utils";

export default function CalendarSerieCard({ episode }) {
  const isBatch = episode.type === "season-batch";

  const { tmdbId, seriesTitle, posterPath, networks, seasonNumber } = episode;

  const network = networks?.[0];

  // === Mode "season-batch" : drop Netflix-style ===
  if (isBatch) {
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
            <Link href={`/series/${tmdbId}`} className={styles.titleLink}>
              <h3 className={styles.title}>{seriesTitle}</h3>
            </Link>
            <div className={styles.episodeInfo}>
              Season {seasonNumber} · {episode.episodeCount} new episodes
            </div>
          </div>

          <div className={styles.meta}>
            <span className={styles.metaDuration} />
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
            <span className={styles.metaRating} />
          </div>
        </div>
      </div>
    );
  }

  // === Mode "episode" : comportement existant inchangé ===
  const { episodeNumber, seasonEpisodeCount, title: episodeTitle, overview, duration, ratings } = episode;

  const episodeCode = `S${String(seasonNumber).padStart(2, "0")}E${String(episodeNumber).padStart(2, "0")}`;

  // Badge Premiere / Finale
  let badge = null;
  if (episodeNumber === 1) {
    badge = { label: "Premiere", className: styles.badgePremiere };
  } else if (seasonEpisodeCount && episodeNumber === seasonEpisodeCount) {
    badge = { label: "Finale", className: styles.badgeFinale };
  }

  // Note TMDB → pourcentage (score sur 10)
  const tmdbScore = ratings?.tmdb?.score;
  const ratingPercent = typeof tmdbScore === "number" ? Math.round(tmdbScore * 10) : null;

  return (
    <div className={`card ${styles.card}`}>
      {/* Poster gauche */}
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

      {/* Contenu droite */}
      <div className={styles.content}>
        <div className={styles.header}>
          {badge && <span className={`${styles.badge} ${badge.className}`}>{badge.label}</span>}
          <Link href={`/series/${tmdbId}`} className={styles.titleLink}>
            <h3 className={styles.title}>{seriesTitle}</h3>
          </Link>
          <div className={styles.episodeInfo}>
            {episodeCode}
            {episodeTitle && ` · ${episodeTitle}`}
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
