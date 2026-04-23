"use client";

import { useMemo, useState, useEffect } from "react";
import styles from "./MonthGrid.module.css";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Retourne le nombre de jours du mois (year, month: 0-indexed) */
const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

/** Retourne l'index du jour de la semaine du 1er du mois (0=lundi … 6=dimanche) */
const firstWeekdayIndex = (year, month) => {
  const day = new Date(year, month, 1).getDay(); // 0=dimanche … 6=samedi
  return (day + 6) % 7; // 0=lundi … 6=dimanche
};

/** Convertit (year, month 0-indexed, day) en "YYYY-MM-DD" */
const toDateKey = (year, month, day) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

/**
 * Grille du mois avec navigation ← →.
 * - datesWithEpisodes : Set<string> des dates YYYY-MM-DD qui ont des épisodes
 * - activeDate : date YYYY-MM-DD actuellement mise en évidence
 * - onDayClick(date) : appelé au clic sur un jour qui a des épisodes
 */
export default function MonthGrid({ episodeCountByDate, activeDate, onDayClick }) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  // Si activeDate change et tombe en dehors du mois affiché, synchronise le curseur
  useEffect(() => {
    if (!activeDate) return;
    const [y, m] = activeDate.split("-").map(Number);
    if (y !== cursor.year || m - 1 !== cursor.month) {
      setCursor({ year: y, month: m - 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDate]);

  const { year, month } = cursor;
  const totalDays = daysInMonth(year, month);
  const leadingBlanks = firstWeekdayIndex(year, month);
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push({ blank: true, key: `b${i}` });
  for (let d = 1; d <= totalDays; d++) {
    const dateKey = toDateKey(year, month, d);
    const count = episodeCountByDate.get(dateKey) ?? 0;
    cells.push({
      blank: false,
      key: dateKey,
      day: d,
      dateKey,
      episodeCount: count,
      hasEpisodes: count > 0,
      isToday: dateKey === todayKey,
      isActive: dateKey === activeDate,
    });
  }

  const goPrev = () => {
    setCursor(({ year, month }) => (month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }));
  };
  const goNext = () => {
    setCursor(({ year, month }) => (month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }));
  };

  return (
    <div className={styles.grid} aria-label="Calendar month navigator">
      <div className={styles.header}>
        <button type="button" className={styles.navBtn} onClick={goPrev} aria-label="Previous month">
          ‹
        </button>
        <div className={styles.monthLabel}>
          {MONTHS[month]} <span className={styles.year}>{year}</span>
        </div>
        <button type="button" className={styles.navBtn} onClick={goNext} aria-label="Next month">
          ›
        </button>
      </div>

      <div className={styles.weekdays}>
        {WEEKDAYS.map((w) => (
          <span key={w} className={styles.weekday}>
            {w}
          </span>
        ))}
      </div>

      <div className={styles.days}>
        {cells.map((cell) =>
          cell.blank ? (
            <span key={cell.key} className={styles.blank} />
          ) : (
            <DayCell key={cell.key} cell={cell} onClick={onDayClick} />
          ),
        )}
      </div>
    </div>
  );
}

function DayCell({ cell, onClick }) {
  const { day, dateKey, episodeCount, hasEpisodes, isToday, isActive } = cell;

  const className = [
    styles.day,
    hasEpisodes && styles.dayHasEpisodes,
    isToday && styles.dayToday,
    isActive && styles.dayActive,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = () => {
    if (hasEpisodes && onClick) onClick(dateKey);
  };

  // Rendu des pastilles : 1 ou 2 points, puis "+" si plus
  const dotsToRender = Math.min(episodeCount, 2);
  const showPlus = episodeCount > 2;

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={!hasEpisodes}
      aria-label={`Day ${day}${hasEpisodes ? `, ${episodeCount} episode${episodeCount > 1 ? "s" : ""}` : ""}`}
      aria-current={isActive ? "date" : undefined}
    >
      <span className={styles.dayNumber}>{day}</span>
      {hasEpisodes && (
        <span className={styles.dots} aria-hidden="true">
          {Array.from({ length: dotsToRender }).map((_, i) => (
            <span key={i} className={styles.dot} />
          ))}
          {showPlus && <span className={styles.plus}>+</span>}
        </span>
      )}
    </button>
  );
}
