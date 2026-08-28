"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatWeekdayDate } from "@/lib/utils/date.utils";
import { formatDuration } from "@/lib/utils/duration.utils";
import { formatEpisodeLabel } from "@/lib/utils/episode.utils";
import { shouldInvertLogo } from "@/lib/utils/network.utils";
import styles from "./UpcomingDayCard.module.css";

const getRelativeDayLabel = (dateStr) => {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return `In ${diffDays} days`;
};

export default function UpcomingDayCard({ day }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prevPosterPath, setPrevPosterPath] = useState(null);

  // Modulo pour rester toujours dans les bornes, même si day.episodes
  // change de taille (évite tout état "hors limites" sans reset explicite)
  const safeIndex = day.episodes.length > 0 ? activeIndex % day.episodes.length : 0;
  const hoveredItem = day.episodes[safeIndex] ?? null;

  // Mémorise le poster affiché juste avant, pour le crossfade
  useEffect(() => {
    setPrevPosterPath(hoveredItem?.posterPath ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredItem?.posterPath]);

  // Rotation automatique toutes les 2s, en pause au survol
  useEffect(() => {
    if (isPaused || day.episodes.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % day.episodes.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, day.episodes.length]);

  const dateLabel = formatWeekdayDate(day.date);
  const relativeDayLabel = getRelativeDayLabel(day.date);

  const network = hoveredItem?.networks?.[0];

  // Durée affichée : si 1 seul épisode → sa durée ; sinon rien
  const hoveredEpList = hoveredItem?.episodes ?? [];
  const formattedDuration =
    hoveredEpList.length === 1 && hoveredEpList[0].duration ? formatDuration(hoveredEpList[0].duration) : null;

  return (
    <div className={`card ${styles.dayCard}`}>
      <div className={styles.posterSection}>
        {/* Ancien poster, en fondu sortant, sous le nouveau */}
        {prevPosterPath && prevPosterPath !== hoveredItem?.posterPath && (
          <Image
            key={`prev-${prevPosterPath}`}
            src={`https://image.tmdb.org/t/p/w185${prevPosterPath}`}
            alt=""
            aria-hidden="true"
            width={156}
            height={233}
            sizes="156px"
            className={styles.poster}
          />
        )}
        {hoveredItem?.posterPath ? (
          <Image
            key={hoveredItem.posterPath}
            src={`https://image.tmdb.org/t/p/w185${hoveredItem.posterPath}`}
            alt="Season poster"
            width={156}
            height={233}
            sizes="156px"
            loading="eager"
            className={`${styles.poster} ${styles.posterFade}`}
          />
        ) : (
          <div className={styles.posterPlaceholder} />
        )}
        <span className={styles.relativeDayBadge}>{relativeDayLabel}</span>
      </div>
      <div className={styles.contentSection}>
        <p className={styles.dateLabel}>{dateLabel}</p>
        <ul className={styles.episodeList}>
          {day.episodes.map((item, index) => {
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
                onMouseEnter={() => {
                  setIsPaused(true);
                  setActiveIndex(index);
                }}
                onMouseLeave={() => setIsPaused(false)}
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
