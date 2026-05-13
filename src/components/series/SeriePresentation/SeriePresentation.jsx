"use client";

import styles from "./SeriePresentation.module.css";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date.utils";
import { useSerieCard } from "@/hooks/useSerieCard";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import SerieCardPopovers from "@/components/series/SerieCard/SerieCardPopovers";
import SeriePresentationActions from "./SeriePresentationActions";
import CastCarousel from "../CastCarousel/CastCarousel";
import VideoSection from "../VideoSection/VideoSection";

export default function SeriePresentation({ serie, serieData, ratings, cast = [], createdBy = [] }) {
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
  } = useSerieCard(tmdbSerie, undefined, ratings);

  const { progressMap } = useTrackedSeries();
  const progress = progressMap[String(serie.id)];

  return (
    <div className={styles.presentation}>
      {/* Ligne du haut : poster + infos */}
      <div className={styles.topRow}>
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
              {isTracked && progress && (
                <span className={styles.metaItem}>
                  {progress.watchedCount}/{progress.totalCount} watched
                </span>
              )}
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

            {createdBy.length > 0 && (
              <div className={styles.createdBy}>
                <span className={styles.createdByLabel}>Created by:</span>
                {createdBy.map((person, i) => (
                  <span key={person.tmdbId}>
                    <Link href={`/person/${person.tmdbId}`} className={styles.createdByName}>
                      {person.name}
                    </Link>
                    {i < createdBy.length - 1 && <span className={styles.createdBySeparator}> · </span>}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={`card-footer ${styles.footer}`}>
            <SeriePresentationActions
              isTracked={isTracked}
              isFavorite={isFavorite}
              inAnyList={inAnyList}
              score={score}
              tracked={tracked}
              ratings={ratings}
              networks={serie.networks}
              tmdbId={serie.id}
              imdbId={serie.imdb_id}
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

      {/* Carousel casting sur toute la largeur */}
      {cast.length > 0 && <CastCarousel cast={cast} />}

      <VideoSection tmdbId={serie.id} />
    </div>
  );
}
