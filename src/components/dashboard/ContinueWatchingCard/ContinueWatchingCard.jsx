"use client";

import styles from "./ContinueWatchingCard.module.css";
import Image from "next/image";
import Link from "next/link";
import Icon from "@mdi/react";
import { useRef } from "react";
import { mdiCheck, mdiDotsVertical, mdiCloseCircleOutline, mdiCancel } from "@mdi/js";
import { usePopover } from "@/hooks/usePopover";

export default function ContinueWatchingCard({ item, onCheck, onDrop }) {
  const { seriesId, tmdbId, title, posterPath, watchedCount, totalCount, remainingCount, nextEpisode } = item;
  const menuRef = useRef(null);
  const menuPopover = usePopover(menuRef);

  const progressPercent = Math.round((watchedCount / totalCount) * 100);

  const episodeLabel = nextEpisode
    ? `S${String(nextEpisode.seasonNumber).padStart(2, "0")} • E${String(nextEpisode.episodeNumber).padStart(2, "0")}`
    : null;

  const isPremiere = nextEpisode?.episodeNumber === 1;
  const isFinale =
    nextEpisode?.seasonEpisodeCount != null && nextEpisode.episodeNumber === nextEpisode.seasonEpisodeCount;

  const badge = isFinale
    ? { label: "Finale", className: styles.badgeFinal }
    : isPremiere
      ? { label: "Premiere", className: styles.badgePremiere }
      : null;

  const handleDrop = () => {
    menuPopover.close();
    onDrop?.(seriesId);
  };

  return (
    <div className={`tooltip-wrapper ${styles.container}`}>
      <div className="tooltip">{title}</div>
      <div className={`card ${styles.card}`}>
        {/* Poster */}
        <div className={styles.imageContainer}>
          {/* Menu popover */}
          {menuPopover.isOpen && (
            <div className={styles.confirmOverlay} ref={menuRef} role="dialog" aria-label="Drop series confirmation">
              <p className={styles.confirmText}>
                Drop <strong>{title}</strong>?
              </p>
              <p className={styles.confirmHint}>Watched episodes will be kept.</p>
              <div className={styles.confirmActions}>
                <button type="button" className={styles.dropBtn} onClick={handleDrop} title="Drop series">
                  <Icon path={mdiCloseCircleOutline} size={0.7} />
                </button>
                <button type="button" className={styles.cancelBtn} onClick={menuPopover.close} title="Cancel">
                  <Icon path={mdiCancel} size={0.7} />
                </button>
              </div>
            </div>
          )}

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
          {/* Bandeau premiere/final */}
          {badge && <div className={`${styles.badge} ${badge.className}`}>{badge.label}</div>}

          {/* Badge épisodes restants */}
          {remainingCount > 0 && <span className={styles.remainingBadge}>+ {remainingCount}</span>}

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

          {/* Bouton kebab */}
          <button
            type="button"
            className={`btn ${styles.menuButton} ${menuPopover.isOpen ? "active" : ""}`}
            onClick={menuPopover.toggle}
            title="More actions"
            aria-label="More actions"
            aria-haspopup="menu"
            aria-expanded={menuPopover.isOpen}
          >
            <Icon path={mdiDotsVertical} size={0.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
