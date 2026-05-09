import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { getEpisodeFullData } from "@/lib/api/episode.api";
import { APP_NAME } from "@/lib/constants/app.constants";
import EpisodePresentation from "@/components/episode/EpisodePresentation/EpisodePresentation";
import CastCarousel from "@/components/series/CastCarousel/CastCarousel";
import EpisodeVideoSection from "@/components/episode/EpisodeVideoSection/EpisodeVideoSection";
import SeasonEpisodesCarousel from "@/components/episode/SeasonEpisodesCarousel/SeasonEpisodesCarousel";

export async function generateMetadata({ params }) {
  const { tmdbEpisodeId } = await params;
  try {
    const { episode, series } = await getEpisodeFullData(null, tmdbEpisodeId);
    const code = `S${String(episode.seasonNumber).padStart(2, "0")}E${String(episode.episodeNumber).padStart(2, "0")}`;
    return {
      title: `${series.title} ${code}${episode.title ? ` — ${episode.title}` : ""} - ${APP_NAME}`,
    };
  } catch {
    return { title: `Episode - ${APP_NAME}` };
  }
}

export const dynamic = "force-dynamic";

export default async function EpisodePage({ params }) {
  const { tmdbEpisodeId } = await params;
  const session = await getServerSession(authOptions);

  let data;
  try {
    data = await getEpisodeFullData(session?.user?.id ?? null, tmdbEpisodeId);
  } catch {
    notFound();
  }

  const { episode, series, seasonEpisodes, currentProgress } = data;

  const code = `S${String(episode.seasonNumber).padStart(2, "0")} • E${String(episode.episodeNumber).padStart(2, "0")}`;

  return (
    <div className={styles.container}>
      {/* Hero backdrop (celui de la série) */}
      <div className={styles.hero}>
        {series.backdropPath && (
          <Image
            src={`https://image.tmdb.org/t/p/original${series.backdropPath}`}
            alt={series.title}
            fill
            priority
            className={styles.heroImage}
            sizes="100vw"
          />
        )}
        <div className={styles.heroOverlay} />
      </div>

      {/* Spacer + titre */}
      <div className={styles.heroSpacer} aria-hidden="true">
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            {episode.title ?? "—"}
            <span className={styles.heroCode}>{code}</span>
          </h1>

          <Link href={`/series/${series.tmdbId}`} className={styles.heroSeries}>
            {series.title}
          </Link>
        </div>
      </div>

      {/* Carte de présentation */}
      <EpisodePresentation episode={episode} series={series} currentProgress={currentProgress} />

      {/* Cast */}
      {episode.cast?.length > 0 && (
        <div className={styles.section}>
          <CastCarousel cast={episode.cast} />
        </div>
      )}

      {/* Vidéos */}
      {episode.videos?.length > 0 && (
        <div className={styles.section}>
          <EpisodeVideoSection videos={episode.videos} />
        </div>
      )}

      {/* Autres épisodes de la saison */}
      {seasonEpisodes.length > 0 && (
        <div className={styles.section}>
          <SeasonEpisodesCarousel
            episodes={seasonEpisodes}
            currentEpisodeId={episode._id}
            seasonNumber={episode.seasonNumber}
            seriesTmdbId={series.tmdbId}
            seriesData={{
              id: series.tmdbId,
              name: series.title,
              poster_path: series.posterPath,
              backdrop_path: series.backdropPath,
            }}
          />
        </div>
      )}
    </div>
  );
}
