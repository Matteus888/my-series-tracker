import Image from "next/image";
import styles from "./PersonHeroMosaic.module.css";

const COLS = 8;
const ROWS = 2;

export default function PersonHeroMosaic({ posters = [], blurred = false }) {
  const total = COLS * ROWS;
  const tiles = [];
  if (posters.length > 0) {
    for (let i = 0; i < total; i++) {
      tiles.push(posters[i % posters.length]);
    }
  }

  return (
    <div className={`${styles.hero} ${blurred ? styles.blurred : ""}`}>
      {tiles.length > 0 ? (
        <div className={styles.mosaic}>
          {tiles.map((path, i) => (
            <div key={i} className={styles.tile}>
              <Image
                src={`https://image.tmdb.org/t/p/w342${path}`}
                alt=""
                fill
                priority={i < COLS}
                className={styles.tileImage}
                sizes="(max-width: 600px) 33vw, (max-width: 900px) 25vw, (max-width: 1200px) 17vw, 12vw"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.fallback} />
      )}
      <div className={styles.heroOverlay} />
    </div>
  );
}
