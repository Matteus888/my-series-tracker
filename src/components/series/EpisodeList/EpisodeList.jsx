"use client";

import { useState } from "react";
import styles from "./EpisodeList.module.css";
import { useEpisodeList } from "@/hooks/useEpisodeList";
import Icon from "@mdi/react";
import { mdiChevronDown, mdiChevronUp } from "@mdi/js";
import EpisodeCard from "../EpisodeCard/EpisodeCard";

export default function EpisodeList({ initialProgress, tmdbId, serieData }) {
  const { seasons, toggleEpisode } = useEpisodeList(initialProgress, tmdbId, serieData);

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>Episodes</h3>
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
  const [open, setOpen] = useState(true);

  const now = new Date();
  const airedEpisodes = episodes.filter((e) => e.airDate && new Date(e.airDate) <= now);
  const watchedCount = episodes.filter((e) => e.watched).length;

  return (
    <div className={styles.season}>
      {/* Header saison */}
      <button className={styles.seasonHeader} onClick={() => setOpen((o) => !o)}>
        <div className={styles.seasonLeft}>
          <span className={styles.seasonTitle}>Season {seasonNumber}</span>
          <span className={styles.seasonCount}>
            {watchedCount}/{airedEpisodes.length}
          </span>
        </div>
        <Icon path={open ? mdiChevronUp : mdiChevronDown} size={0.9} />
      </button>

      {/* Liste épisodes */}
      {open && (
        <div className={styles.episodeGrid}>
          {episodes.map((ep) => (
            <EpisodeCard key={ep._id ?? `${ep.seasonNumber}-${ep.episodeNumber}`} ep={ep} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}
