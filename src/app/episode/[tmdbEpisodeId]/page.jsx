import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { getEpisodeFullData } from "@/lib/api/episode.api";
import EpisodePresentation from "@/components/episode/EpisodePresentation/EpisodePresentation";
import CastCarousel from "@/components/series/CastCarousel/CastCarousel";
import EpisodeVideoSection from "@/components/episode/EpisodeVideoSection/EpisodeVideoSection";
import SeasonEpisodesCarousel from "@/components/episode/SeasonEpisodesCarousel/SeasonEpisodesCarousel";
import styles from "./page.module.css";

export async function generateMetadata({ params }) {
  const { tmdbEpisodeId } = await params;
  try {
    const { episode, series } = await getEpisodeFullData(null, tmdbEpisodeId);
    const code = `S${String(episode.seasonNumber).padStart(2, "0")}E${String(episode.episodeNumber).padStart(2, "0")}`;
    return {
      title: `${series.title} ${code}${episode.title ? ` — ${episode.title}` : ""}`,
    };
  } catch {
    return { title: "Episode" };
  }
}

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

  return (
    <div className={styles.page}>
      <EpisodePresentation episode={episode} series={series} currentProgress={currentProgress} />

      {episode.cast?.length > 0 && <CastCarousel cast={episode.cast} />}

      <EpisodeVideoSection videos={episode.videos ?? []} />

      <SeasonEpisodesCarousel
        episodes={seasonEpisodes}
        currentEpisodeId={episode._id}
        seasonNumber={episode.seasonNumber}
        seriesTmdbId={series.tmdbId}
      />
    </div>
  );
}
