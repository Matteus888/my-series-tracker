import styles from "@/app/series/[id]/page.module.css";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ensureSeriesInDb, getEpisodeProgressForSeries } from "@/lib/api/series.api";
import { getSeriesDetails } from "@/lib/api/tmdb.api";
import { Series } from "@/models/series.model";
import { Episode } from "@/models/episode.model";
import dbConnect from "@/lib/db/db.connect";
import { APP_NAME } from "@/lib/constants/app.constants";
import EpisodeList from "@/components/series/EpisodeList/EpisodeList";
import SeriePresentation from "@/components/series/SeriePresentation/SeriePresentation";
import SimilarSeriesSection from "@/components/series/SimilarSeriesSection/SimilarSeriesSection";

export async function generateMetadata({ params }) {
  const { id } = await params;
  await dbConnect();
  const series = await Series.findOne({ tmdbId: Number(id) })
    .select("title")
    .lean();
  return {
    title: series?.title ? `${series.title} - ${APP_NAME}` : `Series - ${APP_NAME}`,
  };
}

export const dynamic = "force-dynamic";

export default async function SeriesPage({ params }) {
  const { id } = await params;

  await dbConnect();

  // 1. S'assure que la série est en base avec toutes ses données et notes
  let seriesDoc = null;
  try {
    seriesDoc = await ensureSeriesInDb(Series, id);
  } catch (err) {
    console.error("ensureSeriesInDb failed:", err.message);
    seriesDoc = await Series.findOne({ tmdbId: Number(id) }).lean();
  }

  if (!seriesDoc) return <p className={styles.notFoundMessage}>Series not found</p>;

  // 2. Construit l'objet serie pour SeriePresentation depuis le doc en base
  const serie = {
    id: seriesDoc.tmdbId,
    name: seriesDoc.title,
    poster_path: seriesDoc.posterPath,
    backdrop_path: seriesDoc.backdropPath,
    overview: seriesDoc.overview,
    tagline: seriesDoc.tagline,
    first_air_date: seriesDoc.firstAirDate,
    status: seriesDoc.status,
    number_of_seasons: seriesDoc.numberOfSeasons,
    number_of_episodes: seriesDoc.numberOfEpisodes,
    genres: (seriesDoc.genres ?? []).map((name, i) => ({ id: i, name })),
    networks: (seriesDoc.networks ?? []).map((n) => ({
      id: n.id,
      name: n.name,
      logo_path: n.logoPath,
      homepage: n.homepage,
    })),
    vote_average: seriesDoc.ratings?.tmdb?.score,
    vote_count: seriesDoc.ratings?.tmdb?.voteCount,
  };

  const serieData = {
    name: serie.name,
    poster_path: serie.poster_path,
    backdrop_path: serie.backdrop_path,
    overview: serie.overview,
    first_air_date: serie.first_air_date,
    vote_average: serie.vote_average,
    vote_count: serie.vote_count,
  };

  const seriesRatings = seriesDoc.ratings ?? null;

  // 3. Cast et createdBy depuis la base
  let cast = (seriesDoc.cast ?? []).map((c) => ({
    tmdbId: c.tmdbId,
    name: c.name,
    character: c.character,
    profilePath: c.profilePath,
  }));

  let createdBy = (seriesDoc.createdBy ?? []).map((c) => ({
    tmdbId: c.tmdbId,
    name: c.name,
    profilePath: c.profilePath,
  }));

  // Fallback TMDB si la base n'a pas (encore) cast ou createdBy
  if (cast.length === 0 || createdBy.length === 0) {
    const tmdbSerie = await getSeriesDetails(id);
    if (tmdbSerie) {
      if (cast.length === 0 && tmdbSerie.aggregate_credits?.cast?.length > 0) {
        cast = tmdbSerie.aggregate_credits.cast
          .sort((a, b) => (b.total_episode_count ?? 0) - (a.total_episode_count ?? 0))
          .slice(0, 20)
          .map((c) => ({
            tmdbId: c.id,
            name: c.name,
            character:
              (c.roles ?? [])
                .map((r) => r.character)
                .filter(Boolean)
                .join(" / ") || null,
            profilePath: c.profile_path ?? null,
          }));
      }
      if (createdBy.length === 0 && tmdbSerie.created_by?.length > 0) {
        createdBy = tmdbSerie.created_by.map((c) => ({
          tmdbId: c.id,
          name: c.name,
          profilePath: c.profile_path ?? null,
        }));
      }
    }
  }

  // 4. Episodes : avec progress si user connecté, sans sinon
  const session = await getServerSession(authOptions);
  let episodeProgress = [];

  if (session) {
    const raw = await getEpisodeProgressForSeries(session.user.id, seriesDoc._id);
    episodeProgress = raw.map((ep) => ({
      ...ep,
      _id: ep._id.toString(),
      seriesId: ep.seriesId.toString(),
      watchedAt: ep.watchedAt ? ep.watchedAt.toISOString() : null,
      airDate: ep.airDate ? ep.airDate.toISOString() : null,
      createdAt: ep.createdAt ? ep.createdAt.toISOString() : null,
      updatedAt: ep.updatedAt ? ep.updatedAt.toISOString() : null,
    }));
  } else {
    const episodes = await Episode.find({ seriesId: seriesDoc._id })
      .sort({ seasonNumber: 1, episodeNumber: 1 })
      .select("_id tmdbEpisodeId seriesId seasonNumber episodeNumber title stillPath airDate duration ratings overview")
      .lean();

    episodeProgress = episodes.map((ep) => ({
      ...ep,
      _id: ep._id.toString(),
      seriesId: ep.seriesId.toString(),
      airDate: ep.airDate ? ep.airDate.toISOString() : null,
      watched: false,
      watchedAt: null,
      rating: null,
    }));
  }

  return (
    <div className={styles.container}>
      {/* Hero backdrop */}
      <div className={styles.hero}>
        {serie.backdrop_path && (
          <Image
            src={`https://image.tmdb.org/t/p/original${serie.backdrop_path}`}
            alt={serie.name}
            fill
            priority
            className={styles.heroImage}
            sizes="100vw"
          />
        )}
        <div className={styles.heroOverlay} />
      </div>

      <div className={styles.heroSpacer} aria-hidden="true">
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{serie.name}</h1>
          {serie.tagline && <p className={styles.heroTagline}>{serie.tagline}</p>}
        </div>
      </div>

      <SeriePresentation
        serie={serie}
        serieData={serieData}
        ratings={seriesRatings}
        cast={cast}
        createdBy={createdBy}
      />

      {episodeProgress.length > 0 && (
        <div className={styles.episodesSection}>
          <EpisodeList initialProgress={episodeProgress} tmdbId={Number(id)} serieData={serieData} />
        </div>
      )}
      <SimilarSeriesSection tmdbId={Number(id)} />
    </div>
  );
}
