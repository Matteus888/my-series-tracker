import styles from "@/app/series/[id]/page.module.css";
import Image from "next/image";
import { getSeriesDetails, getAllSeasonsWithEpisodes } from "@/lib/api/tmdb.api";
import { formatDate } from "@/lib/utils/date.utils";
import EpisodeList from "@/components/series/EpisodeList/EpisodeList";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getEpisodeProgressForSeries, syncSeriesIfStale } from "@/lib/api/series.api";
import { Series } from "@/models/series.model";
import dbConnect from "@/lib/db/db.connect";
import { APP_NAME } from "@/lib/constants/app.constants";
import SeriePresentation from "@/components/series/SeriePresentation/SeriePresentation";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const serie = await getSeriesDetails(id);
  return {
    title: serie?.name ? `${serie.name} - ${APP_NAME}` : `Series - ${APP_NAME}`,
  };
}

export const dynamic = "force-dynamic";

export default async function SeriesPage({ params }) {
  const { id } = await params;

  const serie = await getSeriesDetails(id);
  if (!serie) return <p className={styles.notFoundMessage}>Series not found</p>;

  syncSeriesIfStale(Series, id).catch((err) => console.error("syncSeriesIfStale failed:", err.message));

  const session = await getServerSession(authOptions);
  let episodeProgress = [];
  let seriesRatings = null;

  await dbConnect();
  const seriesDoc = await Series.findOne({ tmdbId: Number(id) }).lean();
  seriesRatings = seriesDoc?.ratings ?? null;

  if (session && seriesDoc) {
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
  }

  if (episodeProgress.length === 0) {
    const data = await getAllSeasonsWithEpisodes(id);
    if (data?.seasons) {
      episodeProgress = data.seasons.flatMap((season) =>
        season.episodes.map((ep) => ({
          _id: null,
          seriesId: null,
          tmdbEpisodeId: ep.id,
          seasonNumber: season.season_number,
          episodeNumber: ep.episode_number,
          title: ep.name ?? null,
          overview: ep.overview ?? null,
          stillPath: ep.still_path ?? null,
          airDate: ep.air_date ? new Date(ep.air_date).toISOString() : null,
          duration: ep.runtime ?? null,
          ratings: ep.vote_average ? { tmdb: { score: ep.vote_average, voteCount: ep.vote_count ?? 0 } } : null,
          watched: false,
          watchedAt: null,
          rating: null,
          createdAt: null,
          updatedAt: null,
        })),
      );
    }
  }

  const serieData = {
    name: serie.name,
    poster_path: serie.poster_path,
    backdrop_path: serie.backdrop_path,
    overview: serie.overview,
    first_air_date: serie.first_air_date,
    vote_average: serie.vote_average,
    vote_count: serie.vote_count,
  };

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
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{serie.name}</h1>
          {serie.tagline && <p className={styles.heroTagline}>{serie.tagline}</p>}
        </div>
      </div>

      {/* Carte de présentation */}
      <SeriePresentation serie={serie} serieData={serieData} ratings={seriesRatings} />

      {/* Liste épisodes */}
      {episodeProgress.length > 0 && (
        <div className={styles.episodesSection}>
          <EpisodeList initialProgress={episodeProgress} tmdbId={Number(id)} serieData={serieData} />
        </div>
      )}
    </div>
  );
}
