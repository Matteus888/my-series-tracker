import Image from "next/image";
import styles from "./PersonHeroMosaic.module.css";

const COLS = 12;
const ROWS = 3;

/**
 * Mulberry32 — PRNG simple et déterministe à partir d'une seed 32 bits.
 */
const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Hash de chaîne simple (djb2) pour transformer un id en seed numérique.
 */
const hashString = (str) => {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return h >>> 0;
};

/**
 * Fisher-Yates seedé. Retourne une nouvelle liste sans muter l'entrée.
 */
const shuffleStable = (arr, seed) => {
  const result = [...arr];
  const rand = mulberry32(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export default function PersonHeroMosaic({ posters = [], blurred = false, seed = "default" }) {
  const total = COLS * ROWS;
  const tiles = [];
  if (posters.length > 0) {
    const shuffled = shuffleStable(posters, hashString(String(seed)));
    for (let i = 0; i < total; i++) {
      tiles.push(shuffled[i % shuffled.length]);
    }
  }

  return (
    <div className={`${styles.hero} ${blurred ? styles.blurred : ""}`}>
      {tiles.length > 0 ? (
        <div className={styles.mosaic}>
          {tiles.map((path, i) => (
            <div key={i} className={styles.tile}>
              <Image
                src={`https://image.tmdb.org/t/p/w185${path}`}
                alt=""
                fill
                priority={i < COLS}
                className={styles.tileImage}
                sizes="(max-width: 600px) 17vw, (max-width: 900px) 12vw, (max-width: 1200px) 10vw, 8vw"
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
