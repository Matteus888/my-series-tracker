import styles from "./HistoryHeader.module.css";
import { formatLongDuration } from "@/lib/utils/duration.utils";
import Icon from "@mdi/react";
import { mdiLoading } from "@mdi/js";

export default function HistoryHeader({ days, isLoading = false }) {
  const totalEpisodes = days.reduce((sum, day) => sum + day.episodes.length, 0);

  const totalMinutes = days.reduce(
    (sum, day) => sum + day.episodes.reduce((daySum, ep) => daySum + (ep.duration ?? 0), 0),
    0,
  );

  const activeDays = days.length;

  return (
    <section className={styles.wrapper}>
      <div className={styles.title}>
        <h2 className={styles.heading}>Last 30 days</h2>
        <p className={styles.subtitle}>Your recent watching activity</p>
      </div>

      <div className={styles.stats}>
        <Stat label="Episodes" value={totalEpisodes} isLoading={isLoading} />
        <Stat label="Time watched" value={formatLongDuration(totalMinutes) ?? "0min"} isLoading={isLoading} />
        <Stat label="Active days" value={activeDays} isLoading={isLoading} />
      </div>
    </section>
  );
}

function Stat({ label, value, isLoading }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>
        {isLoading ? <Icon path={mdiLoading} size={0.9} className={styles.spinner} /> : value}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
