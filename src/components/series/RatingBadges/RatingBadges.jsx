import styles from "./RatingBadges.module.css";

const SOURCES = [
  {
    key: "tmdb",
    label: "TMDB",
    getValue: (r) => (r?.tmdb?.score ? `${r.tmdb.score.toFixed(1)}/10` : null),
    className: "tmdb",
  },
  {
    key: "imdb",
    label: "IMDb",
    getValue: (r) => (r?.imdb?.score ? `${r.imdb.score.toFixed(1)}/10` : null),
    className: "imdb",
  },
  {
    key: "rt",
    label: "RT",
    getValue: (r) => (r?.rottenTomatoes?.score != null ? `${r.rottenTomatoes.score}%` : null),
    className: "rt",
  },
  {
    key: "mc",
    label: "Metacritic",
    getValue: (r) => (r?.metacritic?.score != null ? `${r.metacritic.score}` : null),
    className: "mc",
  },
  {
    key: "trakt",
    label: "Trakt",
    getValue: (r) => (r?.trakt?.score ? `${r.trakt.score.toFixed(1)}/10` : null),
    className: "trakt",
  },
];

export default function RatingBadges({ ratings }) {
  if (!ratings) return null;

  const visibleSources = SOURCES.map((s) => ({ ...s, value: s.getValue(ratings) })).filter((s) => s.value !== null);

  if (visibleSources.length === 0) return null;

  return (
    <div className={styles.badges}>
      {visibleSources.map((s) => (
        <div key={s.key} className={`${styles.badge} ${styles[s.className]}`} title={s.label}>
          <span className={styles.label}>{s.label}</span>
          <span className={styles.value}>{s.value}</span>
        </div>
      ))}
    </div>
  );
}
