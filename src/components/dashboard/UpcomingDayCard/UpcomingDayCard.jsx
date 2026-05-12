"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDateLabel } from "@/lib/utils/date.utils";
import { formatDuration } from "@/lib/utils/duration.utils";
import { formatEpisodeLabel } from "@/lib/utils/episode.utils";
import { shouldInvertLogo } from "@/lib/utils/network.utils";
import styles from "./UpcomingDayCard.module.css";

export default function UpcomingDayCard({ day }) {
  const [hoveredItem, setHoveredItem] = useState(day.episodes[0] ?? null);
  const dateLabel = formatDateLabel(day.date, { showTomorrow: false });

  const network = hoveredItem?.networks?.[0];

  // Durée affichée : si 1 seul épisode → sa durée ; sinon rien
  const hoveredEpList = hoveredItem?.episodes ?? [];
  const formattedDuration =
    hoveredEpList.length === 1 && hoveredEpList[0].duration ? formatDuration(hoveredEpList[0].duration) : null;

  return (
    <div className={`card ${styles.dayCard}`}>
      <div className={styles.posterSection}>
        {hoveredItem?.posterPath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w185${hoveredItem.posterPath}`}
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
          {day.episodes.map((item) => {
            const epList = item.episodes;
            const isMulti = epList.length > 1;
            const firstEp = epList[0];

            const epCode = item.isFullSeason
              ? `Season ${item.seasonNumber}`
              : isMulti
                ? `S${String(item.seasonNumber).padStart(2, "0")} • ${formatEpisodeLabel(epList)}`
                : `S${String(item.seasonNumber).padStart(2, "0")} • E${String(firstEp.episodeNumber).padStart(2, "0")}`;

            const epNums = epList.map((e) => e.episodeNumber);
            const includesPremiere = epNums.includes(1);
            const includesFinale = item.seasonEpisodeCount != null && epNums.includes(item.seasonEpisodeCount);

            let badge = null;
            if (item.isFullSeason && item.seasonEpisodeCount === 1) {
              badge = { label: "Finale", className: styles.badgeFinal };
            } else if (item.isFullSeason) {
              badge = { label: "Full season", className: styles.badgeFullSeason };
            } else if (includesPremiere) {
              badge = { label: "Premiere", className: styles.badgePremiere };
            } else if (includesFinale) {
              badge = { label: "Finale", className: styles.badgeFinal };
            }

            return (
              <li
                key={item.itemKey}
                className={styles.episodeItem}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(day.episodes[0] ?? null)}
              >
                <Link href={`/series/${item.tmdbId}`} className={styles.episodeLink}>
                  <span className={styles.epTitle}>{item.seriesTitle}</span>
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
              width={92}
              height={92}
              loading="eager"
              className={`${styles.footerNetworkLogo} ${shouldInvertLogo(network.id) ? styles.footerNetworkLogoInverted : ""}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
