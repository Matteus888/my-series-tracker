import styles from "./PublicSerieCard.module.css";
import Image from "next/image";
import Link from "next/link";
import Icon from "@mdi/react";
import { mdiHeart, mdiCheckCircle, mdiPauseCircle, mdiCloseCircle, mdiBookmark } from "@mdi/js";

const STATUS_BADGE = {
  watching: null, // pas de badge, c'est l'état "neutre"
  completed: { icon: mdiCheckCircle, label: "Completed", className: "completed" },
  on_hold: { icon: mdiPauseCircle, label: "On hold", className: "onHold" },
  dropped: { icon: mdiCloseCircle, label: "Dropped", className: "dropped" },
  plan_to_watch: { icon: mdiBookmark, label: "Plan to watch", className: "planToWatch" },
};

export default function PublicSerieCard({ tracked, progress }) {
  const { series, status, isFavorite, rating } = tracked;
  if (!series) return null;

  const { tmdbId, title, posterPath } = series;
  const badge = STATUS_BADGE[status];

  const watched = progress?.watchedCount ?? 0;
  const total = progress?.totalCount ?? series?.numberOfEpisodes ?? 0;
  const percent = total > 0 ? Math.round((watched / total) * 100) : 0;

  return (
    <div className={`tooltip-wrapper ${styles.container}`}>
      <div className="tooltip">{title}</div>
      <div className={`card ${styles.card}`}>
        <Link href={`/series/${tmdbId}`} className={styles.imageLink}>
          {posterPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w342${posterPath}`}
              alt={title}
              fill
              sizes="(max-width: 768px) 45vw, 200px"
              loading="lazy"
              className={styles.image}
            />
          ) : (
            <div className={styles.placeholder}>{title}</div>
          )}

          {/* Badge favori */}
          {isFavorite && (
            <div className={styles.favoriteBadge} title="Favorite">
              <Icon path={mdiHeart} size={0.8} />
            </div>
          )}

          {/* Badge status (sauf "watching") */}
          {badge && (
            <div className={`${styles.statusBadge} ${styles[badge.className]}`} title={badge.label}>
              <Icon path={badge.icon} size={0.7} />
              <span>{badge.label}</span>
            </div>
          )}

          {/* Rating user */}
          {rating != null && (
            <div className={styles.ratingBadge} title={`Rated ${rating}/10`}>
              <Icon path={mdiHeart} size={0.6} />
              <span>{rating}</span>
            </div>
          )}

          {/* Barre de progression — seulement pour watching/completed */}
          {(status === "watching" || status === "completed") && total > 0 && (
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${percent}%` }} />
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}
