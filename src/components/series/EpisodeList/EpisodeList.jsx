"use client";

import styles from "./EpisodeList.module.css";
import { useState, useEffect, useMemo } from "react";
import { useEpisodeList } from "@/hooks/useEpisodeList";
import EpisodeCard from "../EpisodeCard/EpisodeCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import SeasonSelector from "../SeasonSelector/SeasonSelector";

export default function EpisodeList({ initialProgress, tmdbId, serieData }) {
  const { seasons, toggleEpisode } = useEpisodeList(initialProgress, tmdbId, serieData);

  const seasonNumbers = useMemo(
    () =>
      Object.keys(seasons)
        .map(Number)
        .sort((a, b) => a - b),
    [seasons],
  );

  const storageKey = `series-${tmdbId}-active-season`;

  // Saison par défaut : la plus petite avec des épisodes diffusés non vus,
  // sinon la plus petite avec des épisodes à venir, sinon la 1.
  const computeDefaultSeason = () => {
    const now = new Date();
    for (const n of seasonNumbers) {
      const eps = seasons[n];
      const hasUnwatchedAired = eps.some((e) => e.airDate && new Date(e.airDate) <= now && !e.watched);
      if (hasUnwatchedAired) return n;
    }
    for (const n of seasonNumbers) {
      const eps = seasons[n];
      const hasUpcoming = eps.some((e) => e.airDate && new Date(e.airDate) > now);
      if (hasUpcoming) return n;
    }
    return seasonNumbers[0] ?? 1;
  };

  const [activeSeason, setActiveSeason] = useState(null);

  // Initialise depuis localStorage ou via la logique par défaut
  useEffect(() => {
    if (seasonNumbers.length === 0) return;

    let initial = null;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        const parsed = Number(stored);
        if (seasonNumbers.includes(parsed)) initial = parsed;
      }
    }
    if (initial === null) initial = computeDefaultSeason();
    setActiveSeason(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seasonNumbers.length]);

  // Nettoyage des anciennes clés `series-season-{n}-open` (legacy)
  // TODO: remove after 06/2026
  useEffect(() => {
    if (typeof window === "undefined") return;
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && /^series-season-\d+-open$/.test(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }, []);

  const handleSelectSeason = (n) => {
    setActiveSeason(n);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, String(n));
    }
  };

  if (seasonNumbers.length === 0 || activeSeason === null) return null;

  const episodes = seasons[activeSeason] ?? [];
  const now = new Date();
  const airedEpisodes = episodes.filter((e) => e.airDate && new Date(e.airDate) <= now);
  const watchedCount = episodes.filter((e) => e.watched).length;

  return (
    <div className={styles.container}>
      <SectionHeader
        title="Seasons"
        storageKey={`series-${tmdbId}-episodes-open`}
        defaultOpen
        actions={
          <div className={styles.headerActions}>
            <SeasonSelector seasons={seasonNumbers} activeSeason={activeSeason} onSelect={handleSelectSeason} />
            <span className={styles.counter}>
              {watchedCount}/{airedEpisodes.length}
            </span>
          </div>
        }
      >
        <div className={styles.episodeRows}>
          {episodes.map((ep) => (
            <EpisodeCard key={ep._id ?? `${ep.seasonNumber}-${ep.episodeNumber}`} ep={ep} onToggle={toggleEpisode} />
          ))}
        </div>
      </SectionHeader>
    </div>
  );
}
