"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import styles from "./page.module.css";
import PageTitle from "@/components/ui/PageTitle/PageTitle";
import ProgressCard from "@/components/series/ProgressCard/ProgressCard";
import SectionHeader from "@/components/dashboard/SectionHeader/SectionHeader";
import PageLoader from "@/components/ui/PageLoader/PageLoader";
import MonthGrid from "@/components/ui/MonthGrid/MonthGrid";
import { formatDateLabel } from "@/lib/utils/date.utils";
import { useActiveDay } from "@/hooks/useActiveDay";

const buildItem = (ep) => ({
  seriesId: ep.seriesId,
  tmdbId: ep.tmdbId,
  title: ep.seriesTitle,
  posterPath: ep.posterPath,
  networks: ep.networks ?? [],
  watchedCount: 0,
  totalCount: 1,
  remainingCount: 0,
  totalRemainingDuration: 0,
  seasonEpisodeCount: ep.seasonEpisodeCount ?? null,
  nextEpisode: {
    _id: ep.episodeId,
    seasonNumber: ep.seasonNumber,
    episodeNumber: ep.episodeNumber,
    title: ep.title,
    airDate: ep.airDate,
  },
});

export default function CalendarPage() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((d) => {
        setDays(d.calendar ?? []);
        setLoading(false);
      });
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayDay = days.find((d) => d.date === today);
  const otherDays = days.filter((d) => d.date !== today);

  // Dates à observer pour le scroll-spy (Today + tous les jours listés)
  const allDates = useMemo(() => days.map((d) => d.date), [days]);
  const episodeCountByDate = useMemo(() => new Map(days.map((d) => [d.date, d.episodes.length])), [days]);

  const activeDate = useActiveDay(allDates);

  // Clic sur un jour de la grille : scroll vers sa section
  const handleDayClick = useCallback((date) => {
    const el = document.querySelector(`[data-date="${date}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (loading)
    return (
      <div className={styles.page}>
        <PageTitle title="Calendar" />
        <PageLoader />
      </div>
    );

  return (
    <div className={styles.page}>
      <PageTitle title="Calendar" />

      <div className={styles.layout}>
        <div className={styles.main}>
          {/* Section Today — toujours affichée */}
          <div className={styles.daySection} data-date={today}>
            <SectionHeader title="Today">
              {todayDay ? (
                <div className={styles.grid}>
                  {todayDay.episodes.map((ep) => (
                    <div key={ep.episodeId} className={styles.gridItem}>
                      <ProgressCard item={buildItem(ep)} compact />
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.muted}>No episodes today.</p>
              )}
            </SectionHeader>
          </div>

          {/* Autres jours */}
          {otherDays.map((day) => (
            <div key={day.date} className={styles.daySection} data-date={day.date}>
              <SectionHeader title={formatDateLabel(day.date)}>
                <div className={styles.grid}>
                  {day.episodes.map((ep) => (
                    <div key={ep.episodeId} className={styles.gridItem}>
                      <ProgressCard item={buildItem(ep)} compact />
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
              activeDate={activeDate ?? today}
              onDayClick={handleDayClick}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
