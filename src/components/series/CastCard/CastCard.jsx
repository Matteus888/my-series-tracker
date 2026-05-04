"use client";

import styles from "./CastCard.module.css";
import Image from "next/image";
import Link from "next/link";

export default function CastCard({ person }) {
  return (
    <Link href={`/person/${person.tmdbId}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {person.profilePath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w185${person.profilePath}`}
            alt={person.name}
            fill
            sizes="140px"
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder}>
            <span>{person.name?.charAt(0) ?? "?"}</span>
          </div>
        )}
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{person.name}</span>
        {person.character && <span className={styles.character}>{person.character}</span>}
      </div>
    </Link>
  );
}
