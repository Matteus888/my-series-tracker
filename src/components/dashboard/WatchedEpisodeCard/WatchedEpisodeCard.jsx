"use client";

import styles from "./WatchedEpisodeCard.module.css";
import Image from "next/image";
import Link from "next/link";
import Icon from "@mdi/react";
import { mdiCheck } from "@mdi/js";
import HeartRating from "@/components/ui/HeartRating/HeartRating";
import RatingsPopover from "@/components/ui/RatingsPopover/RatingsPopover";
import { computeAverageScore } from "@/lib/utils/ratings.utils";
import { formatRecentWatchedLabel } from "@/lib/utils/date.utils";
import { usePopover } from "@/hooks/usePopover";
import { useEpisodeRating } from "@/hooks/useEpisodeRating";

export default function WatchedEpisodeCard({
  ep,
  onToggle,
  onRate,
  seriesTitle,
  showSeason,
  showDate,
  disableTooltip,
  readOnly = false,
}) {
  const now = new Date();
  const isAired = ep.airDate ? new Date(ep.airDate) <= now : false;
  const episodeCode = showSeason
    ? `S${String(ep.seasonNumber).padStart(2, "0")} • E${String(ep.episodeNumber).padStart(2, "0")}`
    : `E${String(ep.episodeNumber).padStart(2, "0")}`;

  const score = ep.watched ? computeAverageScore(ep.ratings) : null;

  const ratingsPopover = usePopover();
  const { rating, updateRating } = useEpisodeRating(ep._id, ep.rating, onRate);

  const watchedTime = ep.watchedAt
    ? new Date(ep.watchedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : null;
  const watchedDate = ep.watchedAt ? formatRecentWatchedLabel(ep.watchedAt) : null;

  return (
    <div className={`tooltip-wrapper ${styles.container}`}>
      {!disableTooltip && <div className="tooltip">{seriesTitle ?? ep.title ?? episodeCode}</div>}
      <div className={`card ${styles.card} ${!isAired ? styles.notAired : ""}`}>
        {/* Still 16:9 */}
        <Link
          href={`/episode/${ep.tmdbEpisodeId}`}
          className={styles.imageContainer}
          aria-label={`View details for ${ep.title ?? episodeCode}`}
        >
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
        </Link>

        {/* Badge date et heure visionnage */}
        {ep.watched && watchedTime && (
          <span className={styles.dateBadge}>{showDate ? `${watchedDate} • ${watchedTime}` : watchedTime}</span>
        )}

        {/* Footer */}
        <div className={`card-footer ${styles.footer}`}>
          <button
            className={`btn check ${styles.checkButton} ${ep.watched ? "active" : ""}`}
            onClick={
              readOnly ? undefined : () => isAired && onToggle(ep._id, ep.watched, ep.seasonNumber, ep.episodeNumber)
            }
            disabled={readOnly || !isAired}
            title={
              readOnly
                ? ep.watched
                  ? "Watched"
                  : "Not watched"
                : !isAired
                  ? "Not aired yet"
                  : ep.watched
                    ? "Mark as unwatched"
                    : "Mark as watched"
            }
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
              onClick={readOnly ? undefined : ratingsPopover.toggle}
              title={
                readOnly
                  ? rating
                    ? `Rated ${rating}/10`
                    : null
                  : rating
                    ? `Your rating: ${rating}/10`
                    : "Rate this episode"
              }
              style={readOnly ? { cursor: "default" } : undefined}
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
        {!readOnly && ratingsPopover.isOpen && (
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
