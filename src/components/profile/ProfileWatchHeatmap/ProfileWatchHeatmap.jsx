"use client";

import { useMemo, useState } from "react";
import styles from "./ProfileWatchHeatmap.module.css";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";

const DAYS_TO_SHOW = 364; // 52 semaines exactes
const WEEKDAY_LABELS = ["Mon", "Wed", "Fri"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Renvoie le niveau d'intensité (0 à 4) selon le nombre d'épisodes
function intensityLevel(count) {
  if (!count || count === 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export default function ProfileWatchHeatmap({ heatmap, username }) {
  const [tooltip, setTooltip] = useState(null); // { x, y, text }

  const { weeks, monthMarkers, totalEpisodes, activeDays } = useMemo(() => {
    const map = heatmap ?? {};

    // On part d'aujourd'hui et on recule pour aligner la dernière colonne sur la semaine courante.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // On veut que la grille se termine aujourd'hui. On recule jusqu'au lundi le plus ancien.
    const end = new Date(today);
    const start = new Date(today);
    start.setDate(start.getDate() - DAYS_TO_SHOW);

    // Recale start sur un lundi (getDay : 0=dim, 1=lun)
    const startDay = start.getDay();
    const offsetToMonday = (startDay + 6) % 7;
    start.setDate(start.getDate() - offsetToMonday);

    const days = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      const count = map[key] ?? 0;
      days.push({ key, count, date: new Date(cursor) });
      cursor.setDate(cursor.getDate() + 1);
    }

    // Regroupe en colonnes de 7 (semaines)
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    // Marqueurs de mois : pour chaque semaine, si le 1er jour change de mois → label
    const monthMarkers = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const firstDay = week[0]?.date;
      if (!firstDay) return;
      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        monthMarkers.push({ weekIndex: wi, label: MONTH_LABELS[month] });
        lastMonth = month;
      }
    });

    const totalEpisodes = Object.values(map).reduce((s, c) => s + c, 0);
    const activeDays = Object.values(map).filter((c) => c > 0).length;

    return { weeks, monthMarkers, totalEpisodes, activeDays };
  }, [heatmap]);

  // Si aucune activité du tout, on masque la section
  if (totalEpisodes === 0) return null;

  return (
    <SectionHeader
      title="Watch activity"
      subtitle={`${totalEpisodes} episodes over the past year`}
      storageKey={`profile-${username}-heatmap-open`}
      defaultOpen
    >
      <div className={styles.wrapper}>
        <div className={styles.scrollArea}>
          {/* Labels de mois */}
          <div className={styles.monthRow}>
            {weeks.map((_, wi) => {
              const marker = monthMarkers.find((m) => m.weekIndex === wi);
              return (
                <div key={wi} className={styles.monthCell}>
                  {marker ? marker.label : ""}
                </div>
              );
            })}
          </div>

          <div className={styles.gridArea}>
            {/* Labels des jours (gauche) */}
            <div className={styles.weekdayCol}>
              {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => (
                <div key={i} className={styles.weekdayCell}>
                  {label}
                </div>
              ))}
            </div>

            {/* Grille */}
            <div className={styles.grid}>
              {weeks.map((week, wi) => (
                <div key={wi} className={styles.weekCol}>
                  {week.map((day) => (
                    <div
                      key={day.key}
                      className={`${styles.cell} ${styles[`level${intensityLevel(day.count)}`]}`}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const wrapRect = e.currentTarget.closest(`.${styles.wrapper}`).getBoundingClientRect();
                        setTooltip({
                          x: rect.left - wrapRect.left + rect.width / 2,
                          y: rect.top - wrapRect.top,
                          text: `${day.count} episode${day.count !== 1 ? "s" : ""} · ${formatDayLabel(day.key)}`,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Légende */}
          <div className={styles.legend}>
            <span className={styles.legendLabel}>Less</span>
            {[0, 1, 2, 3, 4].map((lvl) => (
              <div key={lvl} className={`${styles.cell} ${styles[`level${lvl}`]}`} />
            ))}
            <span className={styles.legendLabel}>More</span>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div className={styles.tooltip} style={{ left: tooltip.x, top: tooltip.y }}>
            {tooltip.text}
          </div>
        )}
      </div>
    </SectionHeader>
  );
}
