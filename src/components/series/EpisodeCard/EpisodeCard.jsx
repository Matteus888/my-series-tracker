"use client";

import styles from "./EpisodeCard.module.css";
import Image from "next/image";
import Icon from "@mdi/react";
import { mdiCheck } from "@mdi/js";

export default function EpisodeCard({ ep, onToggle }) {
  const now = new Date();
  const isAired = ep.airDate ? new Date(ep.airDate) <= now : false;

  const episodeLabel = `E${String(ep.episodeNumber).padStart(2, "0")}`;

  return (
    <div className={`tooltip-wrapper ${styles.container}`}>
      <div className="tooltip">{ep.title ?? episodeLabel}</div>
      <div className={`card ${styles.card} ${!isAired ? styles.notAired : ""}`}>
        {/* Still 16:9 */}
        <div className={styles.imageContainer}>
          {ep.stillPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w185${ep.stillPath}`}
              alt={ep.title ?? episodeLabel}
              fill
              loading="eager"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              className={styles.image}
            />
          ) : (
            <div className={styles.placeholder}>
              <span>{episodeLabel}</span>
            </div>
          )}
          <span className={styles.episodeBadge}>{episodeLabel}</span>
        </div>

        {/* Footer */}
        <div className={`card-footer ${styles.footer}`}>
          <span className={styles.title}>{ep.title ?? "—"}</span>
          <button
            className={`btn check ${styles.checkButton} ${ep.watched ? "active" : ""}`}
            onClick={() => isAired && onToggle(ep._id, ep.watched, ep.seasonNumber, ep.episodeNumber)}
            disabled={!isAired}
            title={!isAired ? "Not aired yet" : ep.watched ? "Mark as unwatched" : "Mark as watched"}
          >
            <Icon path={mdiCheck} size={0.9} />
          </button>
        </div>
      </div>
    </div>
  );
}
