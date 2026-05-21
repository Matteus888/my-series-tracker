import styles from "./PublicSerieCard.module.css";
import Image from "next/image";
import Link from "next/link";
import Icon from "@mdi/react";
import { mdiCheck, mdiPause, mdiClose, mdiBookmarkOutline } from "@mdi/js";
import HeartRating from "@/components/ui/HeartRating/HeartRating";

// Indicateur de status — façon "badge coin" reprenant le style du rating.
// "watching" n'a pas d'indicateur (état neutre).
const STATUS_INDICATOR = {
  completed: { icon: mdiCheck, className: "completed", title: "Completed" },
  on_hold: { icon: mdiPause, className: "onHold", title: "On hold" },
  dropped: { icon: mdiClose, className: "dropped", title: "Dropped" },
  plan_to_watch: { icon: mdiBookmarkOutline, className: "planToWatch", title: "Plan to watch" },
};

export default function PublicSerieCard({ tracked, progress }) {
  const { series, status, rating } = tracked;
  if (!series) return null;

  const { tmdbId, title, posterPath } = series;
  const indicator = STATUS_INDICATOR[status];

  const watched = progress?.watchedCount ?? 0;
  const total = progress?.totalCount ?? series?.numberOfEpisodes ?? 0;
  const percent = total > 0 ? Math.round((watched / total) * 100) : 0;

  // Le rating user est sur 10 → on le convertit en pourcentage pour HeartRating
  const ratingPercent = rating != null ? rating * 10 : 0;

  return (
    <div className={`tooltip-wrapper ${styles.container}`}>
      <div className="tooltip">{title}</div>
      <div className={`card ${styles.card}`}>
        <div className={styles.imageContainer}>
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
          </Link>

          {/* Indicateur de status (coin haut-droite) */}
          {indicator && (
            <div className={`${styles.statusIndicator} ${styles[indicator.className]}`} title={indicator.title}>
              <Icon path={indicator.icon} size={0.7} />
            </div>
          )}

          {/* Rating utilisateur (coin bas-droite) — style HeartRating */}
          {rating != null && (
            <div className={styles.ratingBadge} title={`Rated ${rating}/10`}>
              <HeartRating percentage={ratingPercent} />
              <span className={styles.ratingValue}>{rating}</span>
            </div>
          )}

          {/* Barre de progression — pour watching/completed uniquement */}
          {(status === "watching" || status === "completed") && total > 0 && (
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${percent}%` }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
