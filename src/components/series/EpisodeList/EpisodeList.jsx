"use client";

import styles from "./EpisodeList.module.css";
import { useEpisodeList } from "@/hooks/useEpisodeList";
import EpisodeCard from "../EpisodeCard/EpisodeCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";

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
      <SectionHeader
        title={`Season ${seasonNumber}`}
        subtitle={`${watchedCount}/${airedEpisodes.length}`}
        storageKey={`series-season-${seasonNumber}-open`}
        defaultOpen={watchedCount < airedEpisodes.length}
      >
        <div className={styles.episodeRows}>
          {episodes.map((ep) => (
            <EpisodeCard
              key={ep._id ?? `${ep.seasonNumber}-${ep.episodeNumber}`}
              ep={ep}
              onToggle={onToggle}
              layout="row"
              disableTooltip
            />
          ))}
        </div>
      </SectionHeader>
    </div>
  );
}
