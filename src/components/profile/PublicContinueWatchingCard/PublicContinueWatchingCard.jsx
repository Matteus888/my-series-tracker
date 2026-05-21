import styles from "./PublicContinueWatchingCard.module.css";
import Image from "next/image";
import Link from "next/link";

export default function PublicContinueWatchingCard({ item }) {
  const { tmdbId, title, posterPath, watchedCount, totalCount, remainingCount, nextEpisode } = item;

  const progressPercent = Math.round((watchedCount / totalCount) * 100);
  const episodeLabel = nextEpisode
    ? `S${String(nextEpisode.seasonNumber).padStart(2, "0")} • E${String(nextEpisode.episodeNumber).padStart(2, "0")}`
    : null;

  return (
    <div className={`tooltip-wrapper ${styles.container}`}>
      <div className="tooltip">
        {title}
        {remainingCount > 0 && <span className={styles.tooltipRemaining}>{remainingCount} left</span>}
      </div>
      <div className={`card ${styles.card}`}>
        <div className={styles.imageContainer}>
          <Link href={`/series/${tmdbId}`} className={styles.imageLink}>
            {posterPath ? (
              <Image
                src={`https://image.tmdb.org/t/p/w342${posterPath}`}
                alt={title}
                fill
                sizes="150px"
                loading="lazy"
                className={styles.image}
              />
            ) : (
              <div className={styles.placeholder}>{title}</div>
            )}
          </Link>

          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className={`card-footer ${styles.footer}`}>
          <div className={styles.episodeInfo}>
            {episodeLabel ? (
              <>
                <span className={styles.episodeLabel}>{episodeLabel}</span>
                <span className={styles.progressText}>
                  {watchedCount}/{totalCount}
                </span>
              </>
            ) : (
              <span className={styles.episodeLabel}>—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
