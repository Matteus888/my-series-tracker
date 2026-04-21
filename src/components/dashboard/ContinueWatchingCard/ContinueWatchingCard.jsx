"use client";

import styles from "./ContinueWatchingCard.module.css";
import Image from "next/image";
import Link from "next/link";
import Icon from "@mdi/react";
import { mdiCheck } from "@mdi/js";

export default function ContinueWatchingCard({ item, onCheck }) {
  const { seriesId, tmdbId, title, posterPath, watchedCount, totalCount, nextEpisode } = item;

  const progressPercent = Math.round((watchedCount / totalCount) * 100);

  const episodeLabel = nextEpisode
    ? `S${String(nextEpisode.seasonNumber).padStart(2, "0")} • E${String(nextEpisode.episodeNumber).padStart(2, "0")}`
    : null;

  return (
    <div className={`tooltip-wrapper ${styles.container}`}>
      <div className="tooltip">{title}</div>
      <div className={`card ${styles.card}`}>
        {/* Poster */}
        <div className={styles.imageContainer}>
          <Link href={`/series/${tmdbId}`} className={styles.imageLink}>
            {posterPath ? (
              <Image
                src={`https://image.tmdb.org/t/p/w342${posterPath}`}
                alt={title}
                fill
                sizes="150px"
                loading="eager"
                className={styles.image}
              />
            ) : (
              <div className={styles.placeholder}>{title}</div>
            )}
          </Link>

          {/* Barre de progression */}
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Footer */}
        <div className={`card-footer ${styles.footer}`}>
          {/* Bouton check */}
          <button
            className={`btn check ${styles.checkButton}`}
            onClick={() => onCheck(seriesId, nextEpisode._id)}
            title={`Mark ${episodeLabel ?? "next episode"} as watched`}
            disabled={!nextEpisode}
          >
            <Icon path={mdiCheck} size={0.9} />
          </button>

          {/* Infos épisode suivant */}
          <div className={styles.episodeInfo}>
            {episodeLabel ? (
              <div className={styles.content}>
                <span className={styles.title}>{nextEpisode.title}</span>
                <span className={styles.epCode}>{episodeLabel}</span>
              </div>
            ) : (
              <span className={styles.episodeLabelFallback}>…</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
