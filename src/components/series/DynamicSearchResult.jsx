import styles from "./DynamicSearchResult.module.css";
import Link from "next/link";
import Image from "next/image";

export default function DynamicSearchResult({ serie, onSelect }) {
  return (
    <Link
      href={`/series/${serie.id}`}
      className={`${styles.resultContainer} ${styles.borderBottom}`}
      onClick={() => onSelect(serie)}
    >
      <div className={styles.contentWrapper}>
        <div className={styles.imageContainer}>
          <Image
            src={serie.poster_path ? `https://image.tmdb.org/t/p/w92${serie.poster_path}` : "/placeholder.webp"}
            alt={serie.name}
            width={40}
            height={60}
            className={styles.image}
          />
        </div>
        <div className={styles.infoContainer}>
          <p className={styles.title}>{serie.name}</p>
          <p className={styles.year}>{serie.first_air_date ? serie.first_air_date.split("-")[0] : "N/A"}</p>
        </div>
      </div>
    </Link>
  );
}
