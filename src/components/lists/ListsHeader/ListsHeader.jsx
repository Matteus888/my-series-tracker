import styles from "./ListsHeader.module.css";
import Icon from "@mdi/react";
import { mdiLoading } from "@mdi/js";

export default function ListsHeader({ lists, isLoading = false }) {
  const watchlist = lists.find((l) => l.isDefault);
  const watchlistCount = watchlist?.series.length ?? 0;

  const listsCount = lists.length;

  // Total séries dédoublonnées à travers toutes les listes
  const uniqueSeriesIds = new Set();
  for (const list of lists) {
    for (const serie of list.series) {
      uniqueSeriesIds.add(serie._id?.toString());
    }
  }
  const totalSeries = uniqueSeriesIds.size;

  return (
    <section className={styles.wrapper}>
      <div className={styles.title}>
        <h2 className={styles.heading}>Your lists</h2>
        <p className={styles.subtitle}>
          {listsCount} list{listsCount > 1 ? "s" : ""} to organize your series
        </p>
      </div>

      <div className={styles.stats}>
        <Stat label="Lists" value={listsCount} isLoading={isLoading} />
        <Stat label="Watchlist" value={watchlistCount} isLoading={isLoading} />
        <Stat label="Total series" value={totalSeries} isLoading={isLoading} />
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
