import Image from "next/image";
import Link from "next/link";
import styles from "./SerieCreditCard.module.css";

export default function SerieCreditCard({ credit }) {
  const year = credit.firstAirDate ? new Date(credit.firstAirDate).getFullYear() : null;
  const role = credit.character || credit.job || null;
  const epLabel =
    credit.episodeCount > 0 ? `${credit.episodeCount} episode${credit.episodeCount > 1 ? "s" : ""}` : null;

  return (
    <div className={`tooltip-wrapper ${styles.card}`}>
      {/* Tooltip */}
      <div className="tooltip">{credit.name}</div>

      <Link href={`/series/${credit.tmdbId}`} className={styles.posterWrapper} aria-label={credit.name}>
        {credit.posterPath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w342${credit.posterPath}`}
            alt={credit.name}
            width={185}
            height={278}
            className={styles.posterImage}
          />
        ) : (
          <div className={styles.posterPlaceholder}>
            <span>{credit.name.charAt(0)}</span>
          </div>
        )}
        {/* Badge année */}
        {year && <span className={styles.yearBadge}>{year}</span>}
      </Link>

      <div className={styles.info}>
        <div className={styles.role}>{role || "\u00A0"}</div>
        <div className={styles.episodes}>{epLabel || "\u00A0"}</div>
      </div>
    </div>
  );
}
