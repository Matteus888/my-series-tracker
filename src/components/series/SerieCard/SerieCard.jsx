"use client";

import styles from "./SerieCard.module.css";
import Link from "next/link";
import Image from "next/image";
import { useSerieCard } from "@/hooks/useSerieCard";
import SerieCardPopovers from "./SerieCardPopovers";
import SerieCardActions from "./SerieCardActions";

export default function SerieCard({ serie, onCheck }) {
  const {
    isTracked,
    isFavorite,
    tracked,
    score,
    inAnyList,
    confirmPopover,
    watchlistPopover,
    ratingsPopover,
    handleCheck,
    handleConfirm,
    handleFavorite,
    handleWatchlist,
    handleRatings,
  } = useSerieCard(serie, onCheck);

  return (
    <div className={`tooltip-wrapper ${styles.container}`}>
      {/* Tooltip */}
      <div className="tooltip">{serie.name}</div>
      <div className={`card ${styles.card}`}>
        {/* Popovers */}
        <SerieCardPopovers
          serie={serie}
          isTracked={isTracked}
          confirmPopover={confirmPopover}
          watchlistPopover={watchlistPopover}
          ratingsPopover={ratingsPopover}
          onConfirm={handleConfirm}
        />
        {/* Image */}
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
        {/* Footer */}
        <div className={`card-footer ${styles.footer}`}>
          <SerieCardActions
            isTracked={isTracked}
            isFavorite={isFavorite}
            inAnyList={inAnyList}
            score={score}
            tracked={tracked}
            confirmPopover={confirmPopover}
            watchlistPopover={watchlistPopover}
            ratingsPopover={ratingsPopover}
            onCheck={handleCheck}
            onFavorite={handleFavorite}
            onWatchlist={handleWatchlist}
            onRatings={handleRatings}
          />
        </div>
      </div>
    </div>
  );
}
