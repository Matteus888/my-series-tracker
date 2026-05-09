import Image from "next/image";
import Link from "next/link";
import styles from "./SerieCreditCard.module.css";

export default function SerieCreditCard({ credit }) {
  const year = credit.firstAirDate ? new Date(credit.firstAirDate).getFullYear() : null;
  const role = credit.character || credit.job || null;
  const epLabel = credit.episodeCount > 0 ? `${credit.episodeCount} ep${credit.episodeCount > 1 ? "s" : ""}` : null;

  return (
    <div className={styles.card}>
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
      </Link>

      <div className={styles.info}>
        <Link href={`/series/${credit.tmdbId}`} className={styles.title} title={credit.name}>
          {credit.name}
        </Link>
        {role && (
          <div className={styles.role} title={role}>
            {role}
          </div>
        )}
        <div className={styles.meta}>
          {year && <span>{year}</span>}
          {epLabel && (
            <>
              {year && <span className={styles.metaSep}>•</span>}
              <span>{epLabel}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
