import styles from "./WatchingHeader.module.css";
import { formatLongDuration } from "@/lib/utils/duration.utils";
import Icon from "@mdi/react";
import { mdiLoading } from "@mdi/js";

export default function WatchingHeader({ items, isLoading = false }) {
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
        <Stat label="Series" value={seriesCount} isLoading={isLoading} />
        <Stat label="Episodes left" value={totalRemainingEpisodes} isLoading={isLoading} />
        <Stat label="Time left" value={formatLongDuration(totalRemainingDuration) ?? "0min"} isLoading={isLoading} />
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
