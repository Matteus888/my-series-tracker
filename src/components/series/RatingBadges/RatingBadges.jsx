import styles from "./RatingBadges.module.css";

const SOURCES = [
  {
    key: "tmdb",
    label: "TMDB",
    getValue: (r) => (r?.tmdb?.score ? `${r.tmdb.score.toFixed(1)}/10` : null),
    getUrl: ({ tmdbId }) => (tmdbId ? `https://www.themoviedb.org/tv/${tmdbId}` : null),
    className: "tmdb",
  },
  {
    key: "imdb",
    label: "IMDB",
    getValue: (r) => (r?.imdb?.score ? `${r.imdb.score.toFixed(1)}/10` : null),
    getUrl: ({ imdbId }) => (imdbId ? `https://www.imdb.com/title/${imdbId}/` : null),
    className: "imdb",
  },
  {
    key: "rt",
    label: "RT",
    getValue: (r) => (r?.rottenTomatoes?.score != null ? `${r.rottenTomatoes.score}%` : null),
    getUrl: () => null,
    className: "rt",
  },
  {
    key: "mc",
    label: "Metacritic",
    getValue: (r) => (r?.metacritic?.score != null ? `${r.metacritic.score}` : null),
    getUrl: () => null,
    className: "mc",
  },
  {
    key: "trakt",
    label: "Trakt",
    getValue: (r) => (r?.trakt?.score ? `${r.trakt.score.toFixed(1)}/10` : null),
    getUrl: ({ imdbId }) => (imdbId ? `https://trakt.tv/search/imdb/${imdbId}?id_type=show` : null),
    className: "trakt",
  },
];

export default function RatingBadges({ ratings, tmdbId, imdbId }) {
  if (!ratings) return null;

  const ids = { tmdbId, imdbId };

  const visibleSources = SOURCES.map((s) => ({ ...s, value: s.getValue(ratings), url: s.getUrl(ids) })).filter(
    (s) => s.value !== null,
  );

  if (visibleSources.length === 0) return null;

  return (
    <div className={styles.badges}>
      {visibleSources.map((s) => {
        const className = `${styles.badge} ${styles[s.className]} ${s.url ? styles.linked : ""}`;
        const content = (
          <>
            <span className={styles.label}>{s.label}</span>
            <span className={styles.value}>{s.value}</span>
          </>
        );

        return s.url ? (
          <a
            key={s.key}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            title={`View on ${s.label}`}
          >
            {content}
          </a>
        ) : (
          <div key={s.key} className={className} title={s.label}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
