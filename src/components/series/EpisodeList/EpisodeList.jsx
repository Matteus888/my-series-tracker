"use client";

import { useState } from "react";
import styles from "./EpisodeList.module.css";
import { useEpisodeList } from "@/hooks/useEpisodeList";
import Icon from "@mdi/react";
import { mdiChevronDown, mdiChevronUp } from "@mdi/js";
import EpisodeCard from "../EpisodeCard/EpisodeCard";
import SectionHeader from "@/components/dashboard/SectionHeader/SectionHeader";

export default function EpisodeList({ initialProgress, tmdbId, serieData }) {
  const { seasons, toggleEpisode } = useEpisodeList(initialProgress, tmdbId, serieData);

  return (
    <div className={styles.container}>
      {/* <h3 className={styles.sectionTitle}>Episodes</h3> */}
      {Object.entries(seasons)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([seasonNumber, episodes]) => (
          <SeasonBlock
            key={seasonNumber}
            seasonNumber={Number(seasonNumber)}
            episodes={episodes}
            onToggle={toggleEpisode}
          />
        ))}
    </div>
  );
}

function SeasonBlock({ seasonNumber, episodes, onToggle }) {
  const now = new Date();
  const airedEpisodes = episodes.filter((e) => e.airDate && new Date(e.airDate) <= now);
  const watchedCount = episodes.filter((e) => e.watched).length;

  return (
    <div className={styles.season}>
      <SectionHeader title={`Season ${seasonNumber}`} subtitle={`${watchedCount}/${airedEpisodes.length}`}>
        <div className={styles.episodeGrid}>
          {episodes.map((ep) => (
            <EpisodeCard
              key={ep._id ?? `${ep.seasonNumber}-${ep.episodeNumber}`}
              ep={ep}
              onToggle={onToggle}
              disableTooltip
            />
          ))}
        </div>
      </SectionHeader>
    </div>
  );
}
