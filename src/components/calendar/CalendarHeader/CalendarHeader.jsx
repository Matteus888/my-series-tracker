import styles from "./CalendarHeader.module.css";

export default function CalendarHeader({ days }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inOneWeek = new Date(today);
  inOneWeek.setDate(today.getDate() + 7);

  // Compte un item : 1 pour un épisode, episodeCount pour un batch
  const countEpisodes = (items) =>
    items.reduce((sum, ep) => sum + (ep.type === "season-batch" ? (ep.episodeCount ?? 0) : 1), 0);

  const totalEpisodes = days.reduce((sum, day) => sum + countEpisodes(day.episodes), 0);

  const thisWeekEpisodes = days.reduce((sum, day) => {
    const date = new Date(day.date);
    if (date >= today && date < inOneWeek) {
      return sum + countEpisodes(day.episodes);
    }
    return sum;
  }, 0);

  // Séries uniques à travers tous les jours
  const uniqueSeriesIds = new Set();
  for (const day of days) {
    for (const ep of day.episodes) {
      if (ep.seriesId) uniqueSeriesIds.add(ep.seriesId);
    }
  }
  const seriesCount = uniqueSeriesIds.size;

  return (
    <section className={styles.wrapper}>
      <div className={styles.title}>
        <h2 className={styles.heading}>Upcoming</h2>
        <p className={styles.subtitle}>What&apos;s coming up next on your tracked series</p>
      </div>

      <div className={styles.stats}>
        <Stat label="Series" value={seriesCount} />
        <Stat label="Episodes" value={totalEpisodes} />
        <Stat label="This week" value={thisWeekEpisodes} />
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
