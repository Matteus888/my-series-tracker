"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDateLabel } from "@/lib/utils/date.utils";
import { formatDuration } from "@/lib/utils/duration.utils";
import { shouldInvertLogo } from "@/lib/utils/network.utils";
import styles from "./UpcomingDayCard.module.css";

export default function UpcomingDayCard({ day }) {
  const [hoveredEp, setHoveredEp] = useState(day.episodes[0] ?? null);
  const dateLabel = formatDateLabel(day.date, { showTomorrow: false });

  const network = hoveredEp?.networks?.[0];
  const formattedDuration = hoveredEp?.duration ? formatDuration(hoveredEp.duration) : null;

  return (
    <div className={`card ${styles.dayCard}`}>
      <div className={styles.posterSection}>
        {hoveredEp?.posterPath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w185${hoveredEp.posterPath}`}
            alt="Season poster"
            width={156}
            height={233}
            sizes="156px"
            loading="eager"
            className={styles.poster}
          />
        ) : (
          <div className={styles.posterPlaceholder} />
        )}
      </div>
      <div className={styles.contentSection}>
        <p className={styles.dateLabel}>{dateLabel}</p>
        <ul className={styles.episodeList}>
          {day.episodes.map((ep) => {
            const isBatch = ep.type === "season-batch";
            const key = isBatch ? ep.batchKey : ep.episodeId;

            const epCode = isBatch
              ? `Season ${ep.seasonNumber}`
              : `S${String(ep.seasonNumber).padStart(2, "0")} • E${String(ep.episodeNumber).padStart(2, "0")}`;

            const isPremiere = !isBatch && ep.episodeNumber === 1;
            const isFinale = !isBatch && ep.seasonEpisodeCount != null && ep.episodeNumber === ep.seasonEpisodeCount;
            const badge = isPremiere
              ? { label: "Premiere", className: styles.badgePremiere }
              : isFinale
                ? { label: "Final", className: styles.badgeFinal }
                : null;
            return (
              <li
                key={key}
                className={styles.episodeItem}
                onMouseEnter={() => setHoveredEp(ep)}
                onMouseLeave={() => setHoveredEp(day.episodes[0] ?? null)}
              >
                <Link href={`/series/${ep.tmdbId}`} className={styles.episodeLink}>
                  <span className={styles.epTitle}>{ep.seriesTitle}</span>
                  <span className={styles.epCodeRow}>
                    <span className={styles.epCode}>{epCode}</span>
                    {badge && <span className={`${styles.badge} ${badge.className}`}>{badge.label}</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className={styles.cardFooter}>
          {formattedDuration && <span className={styles.footerMeta}>{formattedDuration}</span>}
          {network?.logoPath && (
            <Image
              src={`https://image.tmdb.org/t/p/w92${network.logoPath}`}
              alt={network.name}
              width={32}
              height={32}
              loading="eager"
              className={`${styles.footerNetworkLogo} ${shouldInvertLogo(network.id) ? styles.footerNetworkLogoInverted : ""}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
