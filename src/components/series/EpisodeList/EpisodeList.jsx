"use client";

import { useState } from "react";
import styles from "./EpisodeList.module.css";
import { useEpisodeList } from "@/hooks/useEpisodeList";
import Icon from "@mdi/react";
import { mdiCheck, mdiChevronDown, mdiChevronUp } from "@mdi/js";

export default function EpisodeList({ initialProgress, tmdbId, serieData }) {
  const { seasons, toggleEpisode, isTracking } = useEpisodeList(initialProgress, tmdbId, serieData);

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>
        Episodes
        {isTracking && <span className={styles.trackingLabel}> — Adding to your list…</span>}
      </h3>
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
  const total = episodes.length;

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
        <ul className={styles.episodeList}>
          {episodes.map((ep) => {
            const isAired = ep.airDate ? new Date(ep.airDate) <= now : false;

            return (
              <li
                key={ep._id ?? `${ep.seasonNumber}-${ep.episodeNumber}`}
                className={`${styles.episodeRow} ${!isAired ? styles.notAired : ""}`}
              >
                <button
                  className={`btn check ${styles.checkButton} ${ep.watched ? "active" : ""}`}
                  onClick={() => isAired && onToggle(ep._id, ep.watched, ep.seasonNumber, ep.episodeNumber)}
                  disabled={!isAired}
                  title={!isAired ? "Not aired yet" : ep.watched ? "Mark as unwatched" : "Mark as watched"}
                >
                  <Icon path={mdiCheck} size={0.8} />
                </button>
                <span className={styles.episodeCode}>E{String(ep.episodeNumber).padStart(2, "0")}</span>
                <span className={`${styles.episodeTitle} ${ep.watched ? styles.watched : ""}`}>{ep.title ?? "—"}</span>
                {ep.airDate && (
                  <span className={styles.airDate}>
                    {new Date(ep.airDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
