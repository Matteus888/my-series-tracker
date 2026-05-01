"use client";

import styles from "./SeriePresentation.module.css";
import Image from "next/image";
import { formatDate } from "@/lib/utils/date.utils";
import { useSerieCard } from "@/hooks/useSerieCard";
import { shouldInvertLogo } from "@/lib/utils/network.utils";
import SerieCardPopovers from "@/components/series/SerieCard/SerieCardPopovers";
import SeriePresentationActions from "./SeriePresentationActions";

export default function SeriePresentation({ serie }) {
  const tmdbSerie = {
    id: serie.id,
    name: serie.name,
    poster_path: serie.poster_path,
    backdrop_path: serie.backdrop_path,
    overview: serie.overview,
    first_air_date: serie.first_air_date,
    vote_average: serie.vote_average,
    vote_count: serie.vote_count,
  };

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
  } = useSerieCard(tmdbSerie);

  return (
    <div className={styles.presentation}>
      {/* Poster + popovers */}
      <div className={styles.posterWrapper}>
        <SerieCardPopovers
          serie={tmdbSerie}
          isTracked={isTracked}
          confirmPopover={confirmPopover}
          watchlistPopover={watchlistPopover}
          ratingsPopover={ratingsPopover}
          onConfirm={handleConfirm}
        />
        <Image
          src={serie.poster_path ? `https://image.tmdb.org/t/p/w342${serie.poster_path}` : "/placeholder.webp"}
          alt={serie.name}
          width={220}
          height={330}
          className={styles.posterImage}
          priority
        />
      </div>

      {/* Bloc infos */}
      <div className={styles.infoWrapper}>
        <div className={styles.info}>
          <div className={styles.metaRow}>
            {serie.first_air_date && <span className={styles.metaItem}>{formatDate(serie.first_air_date)}</span>}
            {serie.status && <span className={styles.metaItem}>{serie.status}</span>}
            {serie.number_of_seasons && (
              <span className={styles.metaItem}>
                {serie.number_of_seasons} season{serie.number_of_seasons > 1 ? "s" : ""}
              </span>
            )}
            {serie.number_of_episodes && <span className={styles.metaItem}>{serie.number_of_episodes} episodes</span>}
          </div>

          {serie.genres?.length > 0 && (
            <div className={styles.genres}>
              {serie.genres.map((g) => (
                <span key={g.id} className={styles.genreTag}>
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {serie.overview && <p className={styles.overview}>{serie.overview}</p>}

          {serie.networks?.length > 0 && (
            <div className={styles.networks}>
              <span className={styles.networkLabel}>Available on:</span>
              {serie.networks.map((n) =>
                n.logo_path ? (
                  <Image
                    key={n.id}
                    src={`https://image.tmdb.org/t/p/w92${n.logo_path}`}
                    alt={n.name}
                    width={92}
                    height={92}
                    className={`${styles.networkLogo} ${shouldInvertLogo(n.id) ? styles.networkLogoInverted : ""}`}
                    style={{ height: 24, width: "auto", opacity: 0.8 }}
                  />
                ) : (
                  <span key={n.id} className={styles.networkLabel}>
                    {n.name}
                  </span>
                ),
              )}
            </div>
          )}
        </div>

        {/* Footer collé en bas à gauche */}
        <div className={`card-footer ${styles.footer}`}>
          <SeriePresentationActions
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
