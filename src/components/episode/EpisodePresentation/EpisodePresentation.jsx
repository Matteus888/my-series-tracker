"use client";

import styles from "./EpisodePresentation.module.css";
import Image from "next/image";
import Link from "next/link";
import Icon from "@mdi/react";
import { mdiCheck } from "@mdi/js";
import HeartRating from "@/components/ui/HeartRating/HeartRating";
import RatingsPopover from "@/components/ui/RatingsPopover/RatingsPopover";
import RatingBadges from "@/components/series/RatingBadges/RatingBadges";
import { formatDate } from "@/lib/utils/date.utils";
import { computeAverageScore } from "@/lib/utils/ratings.utils";
import { usePopover } from "@/hooks/usePopover";
import { useEpisodeRating } from "@/hooks/useEpisodeRating";
import { useEpisodeWatchToggle } from "@/hooks/useEpisodeWatchToggle";
import { useTraktEpisodeRating } from "@/hooks/useTraktEpisodeRating";

export default function EpisodePresentation({ episode, series, currentProgress }) {
  const now = new Date();
  const isAired = episode.airDate ? new Date(episode.airDate) <= now : false;
  const code = `S${String(episode.seasonNumber).padStart(2, "0")}E${String(episode.episodeNumber).padStart(2, "0")}`;

  const ratingsPopover = usePopover();
  const { watched, toggle, isPending } = useEpisodeWatchToggle({
    episodeId: episode._id,
    initialWatched: currentProgress?.watched ?? false,
    seriesTmdbId: series.tmdbId,
    seriesTitle: series.title,
    seriesData: {
      id: series.tmdbId,
      name: series.title,
      poster_path: series.posterPath,
      backdrop_path: series.backdropPath,
    },
  });
  const { rating, updateRating } = useEpisodeRating(episode._id, currentProgress?.rating ?? null);

  // Lazy-load Trakt episode rating (déclenché seulement si épisode aired)
  const { data: traktData } = useTraktEpisodeRating(isAired ? episode._id : null);

  // Combine les notes TMDB (déjà en base) avec Trakt (lazy)
  const combinedRatings = traktData?.score
    ? { ...episode.ratings, trakt: { score: traktData.score, voteCount: traktData.voteCount } }
    : episode.ratings;

  const score = watched ? computeAverageScore(combinedRatings) : null;

  return (
    <div className={styles.presentation}>
      <div className={styles.topRow}>
        {/* Still 16:9 à gauche */}
        <div className={styles.stillWrapper}>
          {episode.stillPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w780${episode.stillPath}`}
              alt={episode.title ?? code}
              width={780}
              height={439}
              className={styles.stillImage}
              priority
            />
          ) : (
            <div className={styles.stillPlaceholder}>{code}</div>
          )}

          {ratingsPopover.isOpen && (
            <RatingsPopover
              episode={episode}
              currentRating={rating}
              onRate={updateRating}
              popoverRef={ratingsPopover.popoverRef}
            />
          )}
        </div>

        {/* Bloc infos */}
        <div className={styles.infoWrapper}>
          <div className={styles.info}>
            <div className={styles.metaRow}>
              {episode.airDate && <span className={styles.metaItem}>{formatDate(episode.airDate)}</span>}
              {episode.duration && <span className={styles.metaItem}>{episode.duration} min</span>}
              {!isAired && <span className={styles.metaItem}>Not aired yet</span>}
            </div>

            {episode.overview && <p className={styles.overview}>{episode.overview}</p>}

            {episode.crew?.length > 0 && (
              <div className={styles.crew}>
                {episode.crew.map((c, i) => (
                  <span key={`${c.tmdbId}-${c.job}`}>
                    <span className={styles.crewJob}>{c.job}:</span>{" "}
                    <Link href={`/person/${c.tmdbId}`} className={styles.crewName}>
                      {c.name}
                    </Link>
                    {i < episode.crew.length - 1 && <span className={styles.crewSep}> · </span>}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={`card-footer ${styles.footer}`}>
            <div className={styles.actions}>
              <button
                className={`btn check ${styles.button} ${watched ? "active" : ""}`}
                onClick={() => isAired && toggle()}
                disabled={!isAired || isPending}
                title={!isAired ? "Not aired yet" : watched ? "Mark as unwatched" : "Mark as watched"}
              >
                <Icon path={mdiCheck} size={1} />
              </button>

              {watched && (
                <button
                  className={`btn heartWrapper ${styles.button} ${styles.heart} ${ratingsPopover.isOpen ? "active" : ""}`}
                  onClick={ratingsPopover.toggle}
                  title={rating ? `Your rating: ${rating}/10` : "Rate this episode"}
                >
                  <HeartRating percentage={score ?? 0} />
                  {score > 0 && <span className={styles.rating}>{score}%</span>}
                </button>
              )}

              {/* Badges détaillés par source, visibles dès que l'épisode est aired */}
              {isAired && (
                <div className={styles.badgesWrapper}>
                  <RatingBadges ratings={combinedRatings} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
