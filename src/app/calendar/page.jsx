"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import styles from "./page.module.css";
import PageTitle from "@/components/ui/PageTitle/PageTitle";
import CalendarHeader from "@/components/calendar/CalendarHeader/CalendarHeader";
import CalendarSerieCard from "@/components/calendar/CalendarSerieCard/CalendarSerieCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import PageLoader from "@/components/ui/PageLoader/PageLoader";
import MonthGrid from "@/components/ui/MonthGrid/MonthGrid";
import NoEpisodeTodayCard from "@/components/calendar/NoEpisodeTodayCard/NoEpisodeTodayCard";
import { formatDateLabel } from "@/lib/utils/date.utils";
import { useActiveDay } from "@/hooks/useActiveDay";
import { mdiCalendarClockOutline } from "@mdi/js";

export default function CalendarPage() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  const navBounds = useMemo(() => {
    if (days.length === 0) return null;
    const months = days.map((d) => d.date.slice(0, 7)); // "YYYY-MM"
    return {
      min: months.reduce((a, b) => (a < b ? a : b)),
      max: months.reduce((a, b) => (a > b ? a : b)),
    };
  }, [days]);

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
        <PageTitle title="Calendar" icon={mdiCalendarClockOutline} />
        <CalendarHeader days={days} isLoading={loading} />
        <PageLoader />
      </div>
    );

  return (
    <div className={styles.page}>
      <PageTitle title="Calendar" icon={mdiCalendarClockOutline} />
      <CalendarHeader days={days} isLoading={loading} />
      <div className={styles.layout}>
        <div className={styles.main}>
          {/* Section Today — toujours affichée */}
          <div className={styles.daySection} data-date={today}>
            <SectionHeader title="Today">
              {todayDay ? (
                <div className={styles.grid}>
                  {todayDay.episodes.map((ep) => (
                    <div key={ep.itemKey} className={styles.gridItem}>
                      <CalendarSerieCard episode={ep} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.grid}>
                  <div className={styles.gridItem}>
                    <NoEpisodeTodayCard days={days} />
                  </div>
                </div>
              )}
            </SectionHeader>
          </div>

          {/* Autres jours */}
          {otherDays.map((day) => (
            <div key={day.date} className={styles.daySection} data-date={day.date}>
              <SectionHeader title={formatDateLabel(day.date)}>
                <div className={styles.grid}>
                  {day.episodes.map((ep) => (
                    <div key={ep.itemKey} className={styles.gridItem}>
                      <CalendarSerieCard episode={ep} />
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
              navBounds={navBounds}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
