"use client";

import styles from "./StartWatchingCard.module.css";
import Image from "next/image";
import Link from "next/link";
import Icon from "@mdi/react";
import { mdiCheck, mdiPlaylistPlus } from "@mdi/js";
import { usePopover } from "@/hooks/usePopover";
import WatchlistPopover from "@/components/ui/WatchlistPopover/WatchlistPopover";
import ConfirmPopover from "@/components/ui/ConfirmPopover/ConfirmPopover";
import RatingsPopover from "@/components/ui/RatingsPopover/RatingsPopover";
import HeartRating from "@/components/ui/HeartRating/HeartRating";
import { useList } from "@/context/ListContext";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import { useSeries } from "@/hooks/useSeries";
import { computeAverageScore } from "@/lib/utils/ratings.utils";

export default function StartWatchingCard({ item, onCheck, isChecking, showCheck = false }) {
  const { tmdbId, title, posterPath } = item;
  const watchlistPopover = usePopover();
  const confirmPopover = usePopover();
  const ratingsPopover = usePopover();
  const { lists } = useList();
  const { isTracked, trackedSeries } = useTrackedSeries();
  const tracked = isTracked(tmdbId);

  // Objet serie compatible avec WatchlistPopover
  const serie = { id: tmdbId, name: title, poster_path: posterPath };

  const { toggle } = useSeries(tmdbId, serie);

  const inAnyList = lists.some((l) => l.series.some((s) => s.tmdbId === tmdbId));

  // Note moyenne TMDB+IMDB de la série trackée (pour afficher le score à droite)
  const trackedEntry = trackedSeries.find((s) => s.tmdbId === tmdbId);
  const ratings = trackedEntry?.seriesId?.ratings ?? null;
  const score = ratings ? computeAverageScore(ratings) : null;

  const handleConfirm = (confirm) => {
    if (tracked) {
      if (confirm) toggle();
    } else {
      if (confirm === "first") onCheck?.(item, "first");
      if (confirm === "all") onCheck?.(item, "all");
    }
    confirmPopover.close();
  };

  return (
    <div className={`tooltip-wrapper ${styles.container}`}>
      <div className="tooltip">{title}</div>
      <div className={`card ${styles.card}`}>
        {/* Poster */}
        <div className={styles.imageContainer}>
          {/* Popovers */}
          {watchlistPopover.isOpen && (
            <WatchlistPopover serie={serie} onClose={watchlistPopover.close} popoverRef={watchlistPopover.popoverRef} />
          )}
          {confirmPopover.isOpen && (
            <ConfirmPopover
              serieName={title}
              isTracked={tracked}
              onConfirm={handleConfirm}
              popoverRef={confirmPopover.popoverRef}
            />
          )}
          {ratingsPopover.isOpen && <RatingsPopover serie={serie} popoverRef={ratingsPopover.popoverRef} />}
          <Link href={`/series/${tmdbId}`} className={styles.imageLink}>
            {posterPath ? (
              <Image
                src={`https://image.tmdb.org/t/p/w185${posterPath}`}
                alt={title}
                fill
                sizes="175px"
                loading="eager"
                className={styles.image}
              />
            ) : (
              <div className={styles.placeholder}>{title}</div>
            )}
          </Link>
        </div>

        {/* Footer */}
        <div className={`card-footer ${styles.footer}`}>
          <div className={styles.buttonsLeft}>
            {/* Check */}
            {showCheck && (
              <button
                className={`btn check ${styles.button} ${tracked || isChecking || confirmPopover.isOpen ? "active" : ""}`}
                onClick={() => confirmPopover.open()}
                disabled={isChecking}
                title={tracked ? "Tracked" : "Start watching"}
              >
                <Icon path={mdiCheck} size={1} />
              </button>
            )}

            {/* Watchlist */}
            <button
              className={`btn watchlist ${styles.button} ${inAnyList || watchlistPopover.isOpen ? "active" : ""}`}
              onClick={() => watchlistPopover.toggle()}
              title={inAnyList ? "Manage list" : "Add to list"}
            >
              <Icon path={mdiPlaylistPlus} size={1} />
            </button>
          </div>

          {/* Heart à droite — uniquement si trackée et score dispo */}
          {tracked && (score ?? 0) > 0 && (
            <div
              className={`btn heartWrapper ${styles.heartWrapper} ${ratingsPopover.isOpen ? "active" : ""}`}
              onClick={() => ratingsPopover.toggle()}
              title={trackedEntry?.rating ? `Your rating: ${trackedEntry.rating}/10` : "Rate this show"}
            >
              <HeartRating percentage={score} />
              <span className={styles.rating}>{score}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
