"use client";

import { useMemo } from "react";
import Link from "next/link";
import styles from "./PersonEpisodesByShow.module.css";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";
import WatchedEpisodeCard from "@/components/dashboard/WatchedEpisodeCard/WatchedEpisodeCard";

function ShowGroup({ group }) {
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();

  // Récap du rôle de la personne dans cette série (pour le sous-titre)
  const roleSummary = useMemo(() => {
    const characters = new Set();
    const jobs = new Set();
    for (const ep of group.episodes) {
      if (ep.character) characters.add(ep.character);
      for (const j of ep.jobs ?? []) jobs.add(j);
    }
    const parts = [];
    if (characters.size > 0) parts.push(`as ${Array.from(characters).join(" / ")}`);
    if (jobs.size > 0) parts.push(Array.from(jobs).join(" / "));
    return parts.join(" • ");
  }, [group.episodes]);

  if (group.episodes.length === 0) return null;

  return (
    <div className={styles.showGroup}>
      <div className={styles.showHeader}>
        <Link href={`/series/${group.tmdbSeriesId}`} className={styles.showTitle}>
          {group.seriesTitle}
        </Link>
        <div className={styles.showMeta}>
          <span>
            {group.episodes.length} ep{group.episodes.length > 1 ? "s" : ""}
          </span>
          {roleSummary && (
            <>
              <span className={styles.metaSep}>•</span>
              <span className={styles.role}>{roleSummary}</span>
            </>
          )}
        </div>
      </div>

      <div className={styles.carouselContainer}>
        <CarouselArrows canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scrollBy} />
        <div className={styles.track} ref={scrollerRef}>
          {group.episodes.map((ep) => (
            <div key={ep._id} className={styles.cardSlot}>
              <WatchedEpisodeCard ep={ep} showSeason showDate={false} disableTooltip readOnly />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PersonEpisodesByShow({ groups, personName, personTmdbId }) {
  if (!groups || groups.length === 0) return null;

  const totalEpisodes = groups.reduce((sum, g) => sum + g.episodes.length, 0);

  return (
    <SectionHeader
      title={`Episodes featuring ${personName}`}
      subtitle={`${totalEpisodes} episode${totalEpisodes > 1 ? "s" : ""} across ${groups.length} show${groups.length > 1 ? "s" : ""}`}
      storageKey={`person-${personTmdbId}-episodes-open`}
      defaultOpen={false}
    >
      <div className={styles.groups}>
        {groups.map((group) => (
          <ShowGroup key={group.tmdbSeriesId} group={group} personName={personName} />
        ))}
      </div>
    </SectionHeader>
  );
}
