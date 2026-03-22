import styles from "@/app/series/[id]/page.module.css";
import Image from "next/image";
import { getSeriesDetails } from "@/lib/api/tmdb.api";
import { formatDate } from "@/lib/utils/date";

export default async function SeriesPage({ params }) {
  const { id } = await params;

  const serie = await getSeriesDetails(id);
  if (!serie) {
    return <p className={styles.notFoundMessage}>Series not found</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.serieCard}>
        <div className={styles.posterSection}>
          <Image
            src={serie.poster_path ? `https://image.tmdb.org/t/p/w500${serie.poster_path}` : "/placeholder.webp"}
            alt={serie.name}
            width={300}
            height={450}
            className={styles.posterImage}
          />
        </div>
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
    </div>
  );
}
