"use client";

import styles from "./EpisodeCard.module.css";
import Image from "next/image";
import Icon from "@mdi/react";
import { mdiCheck } from "@mdi/js";
import HeartRating from "@/components/ui/HeartRating/HeartRating";
import RatingsPopover from "@/components/ui/RatingsPopover/RatingsPopover";
import { computeAverageScore } from "@/lib/utils/ratings.utils";
import { usePopover } from "@/hooks/usePopover";
import { useEpisodeRating } from "@/hooks/useEpisodeRating";

export default function EpisodeCard({ ep, onToggle, onRate }) {
  const now = new Date();
  const isAired = ep.airDate ? new Date(ep.airDate) <= now : false;
  const episodeCode = `E${String(ep.episodeNumber).padStart(2, "0")}`;

  const score = ep.watched ? computeAverageScore(ep.ratings) : null;

  const ratingsPopover = usePopover();
  const { rating, updateRating } = useEpisodeRating(ep._id, ep.rating, onRate);

  return (
    <div className={`${styles.row} ${!isAired ? styles.notAired : ""}`}>
      {/* Image still à gauche, dans son propre wrapper */}
      <div className={styles.imageWrapper}>
        <div className={styles.imageClip}>
          {ep.stillPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w300${ep.stillPath}`}
              alt={ep.title ?? episodeCode}
              fill
              sizes="(max-width: 640px) 140px, 240px"
              className={styles.image}
            />
          ) : (
            <div className={styles.placeholder}>
              <span>{episodeCode}</span>
            </div>
          )}
        </div>

        {ratingsPopover.isOpen && (
          <RatingsPopover
            episode={ep}
            currentRating={rating}
            onRate={updateRating}
            popoverRef={ratingsPopover.popoverRef}
          />
        )}
      </div>

      {/* Carte contenu à droite : infos en haut, actions en bas */}
      <div className={styles.contentWrapper}>
        <div className={styles.content}>
          <div className={styles.header}>
            <span className={styles.epCode}>{episodeCode}</span>
            <span className={styles.title}>{ep.title ?? "—"}</span>
          </div>
          <div className={styles.meta}>
            {ep.airDate && <span>{new Date(ep.airDate).toLocaleDateString("en-GB")}</span>}
            {ep.duration && <span>{ep.duration} min</span>}
          </div>
          {ep.overview && <p className={styles.overview}>{ep.overview}</p>}
        </div>

        <div className={`card-footer ${styles.footer}`}>
          <div className={styles.actions}>
            <button
              className={`btn check ${styles.actionBtn} ${ep.watched ? "active" : ""}`}
              onClick={() => isAired && onToggle(ep._id, ep.watched, ep.seasonNumber, ep.episodeNumber)}
              disabled={!isAired}
              title={!isAired ? "Not aired yet" : ep.watched ? "Mark as unwatched" : "Mark as watched"}
            >
              <Icon path={mdiCheck} size={1} />
            </button>

            {ep.watched && (
              <button
                className={`btn heartWrapper ${styles.actionBtn} ${styles.heart} ${ratingsPopover.isOpen ? "active" : ""}`}
                onClick={ratingsPopover.toggle}
                title={rating ? `Your rating: ${rating}/10` : "Rate this episode"}
              >
                <HeartRating percentage={score ?? 0} />
                {score > 0 && <span className={styles.rating}>{score}%</span>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
