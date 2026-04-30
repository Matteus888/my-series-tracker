import Icon from "@mdi/react";
import { mdiCalendarClockOutline } from "@mdi/js";
import styles from "./NoEpisodeTodayCard.module.css";

export default function NoEpisodeTodayCard({ days }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Trouve le prochain jour avec des épisodes (strictement après aujourd'hui)
  const nextDay = days.find((day) => {
    const date = new Date(day.date);
    date.setHours(0, 0, 0, 0);
    return date > today;
  });

  // Aucun épisode futur connu
  if (!nextDay || nextDay.episodes.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <Icon path={mdiCalendarClockOutline} size={1.4} />
        </div>
        <div className={styles.content}>
          <span className={styles.label}>No episodes today</span>
          <span className={styles.subtitle}>Nothing scheduled yet</span>
        </div>
      </div>
    );
  }

  // Calcul du nombre de jours
  const nextDate = new Date(nextDay.date);
  nextDate.setHours(0, 0, 0, 0);
  const daysDiff = Math.round((nextDate - today) / (1000 * 60 * 60 * 24));
  const nextLabel = daysDiff === 1 ? "Next: tomorrow" : `Next in ${daysDiff} days`;

  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper}>
        <Icon path={mdiCalendarClockOutline} size={1.4} />
      </div>

      <div className={styles.content}>
        <span className={styles.label}>No episodes today</span>
        <span className={styles.subtitle}>{nextLabel}</span>
      </div>
    </div>
  );
}
