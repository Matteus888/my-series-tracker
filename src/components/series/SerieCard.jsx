"use client";

import styles from "./SerieCard.module.css";
import Icon from "@mdi/react";
import { mdiCheck, mdiBookmarkPlusOutline, mdiHeartOutline, mdiPlaylistPlus } from "@mdi/js";
import Link from "next/link";
import Image from "next/image";
import { useSeries } from "@/hooks/useSeries";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useList } from "@/context/ListContext";
import { useToast } from "@/context/ToastContext";
import { usePopover } from "@/hooks/usePopover";
import ConfirmPopover from "../ui/ConfirmPopover";
import WatchlistPopover from "../ui/WatchlistPopover";

export default function SerieCard({ serie, onCheck }) {
  const { isTracked, isFavorite, toggle, toggleFavorite } = useSeries(serie.id, serie);
  const { requireAuth } = useAuthGuard();
  const { showToast } = useToast();
  const { lists } = useList();
  const confirmPopover = usePopover();
  const watchlistPopover = usePopover();

  const inAnyList = lists.some((l) => l.series.some((s) => s.tmdbId === serie.id));

  const handleCheck = () => {
    requireAuth(() => {
      if (onCheck) {
        onCheck(serie);
        return;
      }
      confirmPopover.open();
    });
  };

  const handleFavorite = () => {
    requireAuth(() => {
      if (!isTracked) {
        showToast("Mark this show as watched first to add it to favorites.", "error");
        return;
      }
      toggleFavorite();
    });
  };

  const handleWatchlist = () => {
    requireAuth(() => watchlistPopover.toggle());
  };

  const handleConfirm = (confirm) => {
    if (isTracked) {
      if (confirm) toggle();
    } else {
      if (confirm) toggle({ markAllWatched: true, status: "completed" });
    }
    confirmPopover.close();
  };

  return (
    <div className={`tooltip-wrapper ${styles.container}`}>
      {/* Tooltip */}
      <div className="tooltip">{serie.name}</div>
      <div className={`card ${styles.card}`}>
        <div className={styles.imageContainer}>
          <Link href={`/series/${serie.id}`} className={styles.imageLink}>
            {serie.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${serie.poster_path}`}
                alt={serie.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={styles.image}
                priority={true}
              />
            ) : (
              <div className={styles.placeholderContainer}>{serie.name}</div>
            )}
          </Link>
          {/* Badge année */}
          {serie.first_air_date && <span className={styles.yearBadge}>{serie.first_air_date.slice(0, 4)}</span>}
        </div>
        <div className={`card-footer ${styles.footer}`}>
          <div className={styles.buttonsContainer}>
            {confirmPopover.isOpen && (
              <ConfirmPopover isTracked={isTracked} onConfirm={handleConfirm} popoverRef={confirmPopover.popoverRef} />
            )}
            {/* Bouton check */}
            <button
              className={`btn check ${styles.button} ${isTracked ? "active" : ""}`}
              onClick={handleCheck}
              title={isTracked ? "Remove from watched" : "Add to watched"}
            >
              <Icon path={mdiCheck} size={1} />
            </button>
            {/* Bouton bookmark */}
            <button
              className={`btn bookmark ${styles.button} ${isFavorite ? "active" : ""}`}
              onClick={handleFavorite}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Icon path={mdiBookmarkPlusOutline} size={1} />
            </button>
            {/* Bouton watchlist */}
            <div className={styles.watchlistWrapper}>
              <button
                className={`btn watchlist ${styles.button} ${inAnyList ? "active" : ""}`}
                onClick={handleWatchlist}
                title={inAnyList ? "Manage list" : "Add to list"}
              >
                <Icon path={mdiPlaylistPlus} size={1} />
              </button>
              {watchlistPopover.isOpen && (
                <WatchlistPopover
                  serie={serie}
                  onClose={watchlistPopover.close}
                  popoverRef={watchlistPopover.popoverRef}
                />
              )}
            </div>
          </div>
          <div className={styles.infoContainer}>
            {serie.vote_average > 0 && (
              <>
                <Icon path={mdiHeartOutline} size={0.8} color="var(--red)" />
                <span className={styles.rating}>{Math.round(serie.vote_average * 10)}%</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
