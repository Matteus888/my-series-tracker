import styles from "./ProfileHero.module.css";

export default function ProfileHero({ posterPaths = [] }) {
  // Prend jusqu'à 12 posters, sinon dégradé simple
  const posters = posterPaths.filter(Boolean).slice(0, 12);

  if (posters.length === 0) {
    return <div className={`${styles.hero} ${styles.heroFallback}`} aria-hidden="true" />;
  }

  return (
    <div className={styles.hero} aria-hidden="true">
      <div className={styles.mosaic}>
        {posters.map((path, i) => (
          <div
            key={`${path}-${i}`}
            className={styles.tile}
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/w342${path})`,
            }}
          />
        ))}
      </div>
      <div className={styles.overlay} />
    </div>
  );
}
