import styles from "@/app/series/[id]/page.module.css";
import Image from "next/image";
import { getSeriesDetails } from "@/lib/api/tmdb.api";
import { formatDate } from "@/lib/utils/date.utils";
import EpisodeList from "@/components/series/EpisodeList/EpisodeList";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getEpisodeProgressForSeries, syncSeriesIfStale } from "@/lib/api/series.api";
import { getAllSeasonsWithEpisodes } from "@/lib/api/tmdb.api";
import { Series } from "@/models/series.model";
import dbConnect from "@/lib/db/db.connect";

export const dynamic = "force-dynamic";

export default async function SeriesPage({ params }) {
  const { id } = await params;

  const serie = await getSeriesDetails(id);
  if (!serie) return <p className={styles.notFoundMessage}>Series not found</p>;

  // Sync en arrière-plan si stale — ne bloque pas le rendu
  syncSeriesIfStale(Series, id).catch((err) => console.error("syncSeriesIfStale failed:", err.message));

  // Récupère la progression si l'utilisateur est connecté
  const session = await getServerSession(authOptions);
  let episodeProgress = [];

  if (session) {
    await dbConnect();
    const seriesDoc = await Series.findOne({ tmdbId: Number(id) }).lean();
    if (seriesDoc) {
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
  }

  if (episodeProgress.length === 0) {
    const { seasons } = await getAllSeasonsWithEpisodes(id);
    episodeProgress = seasons.flatMap((season) =>
      season.episodes.map((ep) => ({
        _id: null, // pas encore en base
        seriesId: null,
        tmdbEpisodeId: ep.id,
        seasonNumber: season.season_number,
        episodeNumber: ep.episode_number,
        title: ep.name ?? null,
        overview: ep.overview ?? null,
        stillPath: ep.still_path ?? null,
        airDate: ep.air_date ? new Date(ep.air_date).toISOString() : null,
        duration: ep.runtime ?? null,
        watched: false,
        watchedAt: null,
        rating: null,
        createdAt: null,
        updatedAt: null,
      })),
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.serieCard}>
        {/* Poster */}
        <div className={styles.posterSection}>
          <Image
            src={serie.poster_path ? `https://image.tmdb.org/t/p/w342${serie.poster_path}` : "/placeholder.webp"}
            alt={serie.name}
            width={200}
            height={300}
            className={styles.posterImage}
            priority
            loading="eager"
          />
        </div>

        {/* Détails */}
        <div className={styles.detailsSection}>
          <h2 className={styles.serieTitle}>{serie.name}</h2>
          {serie.tagline && <p className={styles.serieTagline}>{serie.tagline}</p>}
          <p className={styles.mutedText}>First broadcast: {formatDate(serie.first_air_date)}</p>
          <p className={styles.serieOverview}>{serie.overview}</p>
          {serie.genres?.length > 0 && (
            <p className={styles.mutedText}>Genres: {serie.genres.map((g) => g.name).join(", ")}</p>
          )}
          <p className={styles.mutedText}>Status: {serie.status}</p>
          <p className={styles.mutedText}>Seasons: {serie.number_of_seasons}</p>
          <p className={styles.mutedText}>Episodes: {serie.number_of_episodes}</p>
        </div>
      </div>

      {/* Liste des épisodes — uniquement si la série est en base (episodes upsertés) */}
      {episodeProgress.length > 0 && (
        <EpisodeList
          initialProgress={episodeProgress}
          tmdbId={Number(id)}
          serieData={{
            name: serie.name,
            poster_path: serie.poster_path,
            backdrop_path: serie.backdrop_path,
            overview: serie.overview,
            first_air_date: serie.first_air_date,
            vote_average: serie.vote_average,
            vote_count: serie.vote_count,
          }}
        />
      )}
    </div>
  );
}
