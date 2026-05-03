"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./page.module.css";
import PageTitle from "@/components/ui/PageTitle/PageTitle";
import HistoryHeader from "@/components/history/HistoryHeader/HistoryHeader";
import EpisodeCard from "@/components/series/EpisodeCard/EpisodeCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import PageLoader from "@/components/ui/PageLoader/PageLoader";
import MonthGrid from "@/components/ui/MonthGrid/MonthGrid";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import { formatDateLabel } from "@/lib/utils/date.utils";
import { useActiveDay } from "@/hooks/useActiveDay";
import { mdiHistory } from "@mdi/js";

export default function HistoryPage() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const { incrementWatched } = useTrackedSeries();

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => {
        setDays(d.history ?? []);
        setLoading(false);
      });
  }, []);

  const uncheckEpisode = useCallback(
    async (episodeId) => {
      setDays((prev) =>
        prev
          .map((day) => ({
            ...day,
            episodes: day.episodes.filter((ep) => ep._id !== episodeId),
          }))
          .filter((day) => day.episodes.length > 0),
      );
      try {
        const response = await fetch(`/api/episodes/${episodeId}/watched`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watched: false }),
        });
        if (!response.ok) throw new Error("Failed");
        incrementWatched();
      } catch {
        fetch("/api/history")
          .then((r) => r.json())
          .then((d) => setDays(d.history ?? []));
      }
    },
    [incrementWatched],
  );

  // Dates observées pour le scroll-spy
  const allDates = useMemo(() => days.map((d) => d.date), [days]);

  // Map date -> nb d'épisodes regardés
  const episodeCountByDate = useMemo(() => new Map(days.map((d) => [d.date, d.episodes.length])), [days]);

  // Bornes de navigation : uniquement les mois avec historique
  const navBounds = useMemo(() => {
    if (days.length === 0) return null;
    const months = days.map((d) => d.date.slice(0, 7));
    return {
      min: months.reduce((a, b) => (a < b ? a : b)),
      max: months.reduce((a, b) => (a > b ? a : b)),
    };
  }, [days]);

  const activeDate = useActiveDay(allDates);

  const handleDayClick = useCallback((date) => {
    const el = document.querySelector(`[data-date="${date}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (loading)
    return (
      <div className={styles.page}>
        <PageTitle title="History" icon={mdiHistory} />
        <HistoryHeader days={days} isLoading={loading} />
        <PageLoader />
      </div>
    );

  if (days.length === 0)
    return (
      <div className={styles.page}>
        <PageTitle title="History" icon={mdiHistory} />
        <HistoryHeader days={days} isLoading={loading} />
        <p className={styles.muted}>No episodes watched in the last 30 days.</p>
      </div>
    );

  return (
    <div className={styles.page}>
      <PageTitle title="History" icon={mdiHistory} />
      <HistoryHeader days={days} isLoading={loading} />
      <div className={styles.layout}>
        <div className={styles.main}>
          {days.map((day) => (
            <div key={day.date} className={styles.daySection} data-date={day.date}>
              <SectionHeader title={formatDateLabel(day.date)}>
                <div className={styles.episodeGrid}>
                  {day.episodes.map((ep) => (
                    <div key={ep._id} className={styles.cardWrapper}>
                      <EpisodeCard ep={ep} onToggle={uncheckEpisode} seriesTitle={ep.seriesTitle} showSeason />
                    </div>
                  ))}
                </div>
              </SectionHeader>
            </div>
          ))}
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarSticky}>
            <MonthGrid
              episodeCountByDate={episodeCountByDate}
              activeDate={activeDate ?? days[0]?.date}
              onDayClick={handleDayClick}
              navBounds={navBounds}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
