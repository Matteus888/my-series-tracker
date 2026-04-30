import styles from "./WatchingHeader.module.css";
import { formatLongDuration } from "@/lib/utils/duration.utils";

export default function WatchingHeader({ items }) {
  const seriesCount = items.length;

  const totalRemainingEpisodes = items.reduce((sum, item) => sum + (item.remainingCount ?? 0), 0);

  const totalRemainingDuration = items.reduce((sum, item) => sum + (item.totalRemainingDuration ?? 0), 0);

  return (
    <section className={styles.wrapper}>
      <div className={styles.title}>
        <h2 className={styles.heading}>In progress</h2>
        <p className={styles.subtitle}>
          {seriesCount} serie{seriesCount > 1 ? "s " : " "} you&apos;re currently watching
        </p>
      </div>

      <div className={styles.stats}>
        <Stat label="Series" value={seriesCount} />
        <Stat label="Episodes left" value={totalRemainingEpisodes} />
        <Stat label="Time left" value={formatLongDuration(totalRemainingDuration) ?? "0min"} />
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
