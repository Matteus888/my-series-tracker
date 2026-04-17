"use client";

import styles from "./StartWatchingCard.module.css";
import Image from "next/image";
import Link from "next/link";
import Icon from "@mdi/react";
import { mdiCheck, mdiPlaylistPlus } from "@mdi/js";
import { usePopover } from "@/hooks/usePopover";
import WatchlistPopover from "@/components/ui/WatchlistPopover/WatchlistPopover";
import { useList } from "@/context/ListContext";

export default function StartWatchingCard({ item, onCheck, isChecking }) {
  const { tmdbId, title, posterPath } = item;
  const watchlistPopover = usePopover();
  const { lists } = useList();

  // Objet serie compatible avec WatchlistPopover
  const serie = { id: tmdbId, name: title, poster_path: posterPath };
  const inAnyList = lists.some((l) => l.series.some((s) => s.tmdbId === tmdbId));

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
            <button
              className={`btn check ${styles.button} ${isChecking ? "active" : ""}`}
              onClick={() => onCheck(item)}
              disabled={isChecking}
              title="Start watching"
            >
              <Icon path={mdiCheck} size={1} />
            </button>

            {/* Watchlist */}
            <button
              className={`btn watchlist ${styles.button} ${inAnyList || watchlistPopover.isOpen ? "active" : ""}`}
              onClick={() => watchlistPopover.toggle()}
              title={inAnyList ? "Manage list" : "Add to list"}
            >
              <Icon path={mdiPlaylistPlus} size={1} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
