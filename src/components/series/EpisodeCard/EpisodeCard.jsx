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

export default function EpisodeCard({
  ep,
  onToggle,
  onRate,
  seriesTitle,
  showSeason,
  disableTooltip,
  layout = "card",
}) {
  const now = new Date();
  const isAired = ep.airDate ? new Date(ep.airDate) <= now : false;
  const episodeCode = showSeason
    ? `S${String(ep.seasonNumber).padStart(2, "0")} • E${String(ep.episodeNumber).padStart(2, "0")}`
    : `E${String(ep.episodeNumber).padStart(2, "0")}`;

  const score = ep.watched ? computeAverageScore(ep.ratings) : null;

  const ratingsPopover = usePopover();
  const { rating, updateRating } = useEpisodeRating(ep._id, ep.rating, onRate);

  const sharedProps = {
    ep,
    isAired,
    episodeCode,
    score,
    rating,
    ratingsPopover,
    updateRating,
    onToggle,
  };

  if (layout === "row") {
    return <EpisodeRow {...sharedProps} />;
  }

  return (
    <div className={`tooltip-wrapper ${styles.container}`}>
      {!disableTooltip && <div className="tooltip">{seriesTitle ?? ep.title ?? episodeCode}</div>}
      <div className={`card ${styles.card} ${!isAired ? styles.notAired : ""}`}>
        {/* Still 16:9 */}
        <div className={styles.imageContainer}>
          {ep.stillPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w185${ep.stillPath}`}
              alt={ep.title ?? episodeCode}
              fill
              loading="eager"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              className={styles.image}
            />
          ) : (
            <div className={styles.placeholder}>
              <span>{episodeCode}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`card-footer ${styles.footer}`}>
          <button
            className={`btn check ${styles.checkButton} ${ep.watched ? "active" : ""}`}
            onClick={() => isAired && onToggle(ep._id, ep.watched, ep.seasonNumber, ep.episodeNumber)}
            disabled={!isAired}
            title={!isAired ? "Not aired yet" : ep.watched ? "Mark as unwatched" : "Mark as watched"}
          >
            <Icon path={mdiCheck} size={0.9} />
          </button>
          <div className={styles.content}>
            <span className={styles.title}>{ep.title ?? "—"}</span>
            <span className={styles.epCode}>{episodeCode}</span>
          </div>
          {ep.watched && (
            <div
              className={`btn heartWrapper ${styles.heartWrapper} ${ratingsPopover.isOpen ? "active" : ""}`}
              onClick={ratingsPopover.toggle}
              title={rating ? `Your rating: ${rating}/10` : "Rate this episode"}
            >
              {score > 0 ? (
                <>
                  <HeartRating percentage={score} />
                  <span className={styles.rating}>{score}%</span>
                </>
              ) : (
                <HeartRating percentage={0} />
              )}
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
    </div>
  );
}

function EpisodeRow({ ep, isAired, episodeCode, score, rating, ratingsPopover, updateRating, onToggle }) {
  return (
    <div className={`card ${styles.row} ${!isAired ? styles.notAired : ""}`}>
      {/* Still à gauche, pleine hauteur */}
      <div className={styles.rowImage}>
        {ep.stillPath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w300${ep.stillPath}`}
            alt={ep.title ?? episodeCode}
            fill
            sizes="(max-width: 768px) 120px, 240px"
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder}>
            <span>{episodeCode}</span>
          </div>
        )}
      </div>

      {/* Centre : titre + meta + overview */}
      <div className={styles.rowContent}>
        <div className={styles.rowHeader}>
          <span className={styles.rowEpCode}>{episodeCode}</span>
          <span className={styles.rowTitle}>{ep.title ?? "—"}</span>
        </div>
        <div className={styles.rowMeta}>
          {ep.airDate && <span>{new Date(ep.airDate).toLocaleDateString("en-GB")}</span>}
          {ep.duration && <span>{ep.duration} min</span>}
        </div>
        {ep.overview && <p className={styles.rowOverview}>{ep.overview}</p>}
      </div>

      {/* Droite : actions empilées, collées au bord */}
      <div className={styles.rowActions}>
        <button
          className={`btn check ${styles.rowActionBtn} ${ep.watched ? "active" : ""}`}
          onClick={() => isAired && onToggle(ep._id, ep.watched, ep.seasonNumber, ep.episodeNumber)}
          disabled={!isAired}
          title={!isAired ? "Not aired yet" : ep.watched ? "Mark as unwatched" : "Mark as watched"}
        >
          <Icon path={mdiCheck} size={1} />
        </button>

        {ep.watched && (
          <button
            className={`btn heartWrapper ${styles.rowActionBtn} ${ratingsPopover.isOpen ? "active" : ""}`}
            onClick={ratingsPopover.toggle}
            title={rating ? `Your rating: ${rating}/10` : "Rate this episode"}
          >
            <HeartRating percentage={score ?? 0} />
            {score > 0 && <span className={styles.rowRating}>{score}%</span>}
          </button>
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
  );
}
