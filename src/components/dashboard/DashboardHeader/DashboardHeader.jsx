import styles from "./DashboardHeader.module.css";
import Image from "next/image";
import { formatLongDuration } from "@/lib/utils/duration.utils";

export default function DashboardHeader({ username, firstname, lastname, bio, profilePicture, stats }) {
  const fullName = [firstname, lastname].filter(Boolean).join(" ");
  const { seriesTracked = 0, episodesWatched = 0, totalMinutes = 0, favorites = 0, planToWatch = 0 } = stats ?? {};

  return (
    <section className={styles.wrapper}>
      <div className={styles.identity}>
        <div className={styles.avatarWrapper}>
          <Image
            src={profilePicture || "https://api.dicebear.com/7.x/initials/svg?seed=" + username}
            alt={`${username}'s avatar`}
            width={70}
            height={70}
            loading="eager"
            className={styles.avatar}
            priority
          />
        </div>
        <div className={styles.info}>
          {fullName ? (
            <>
              <h1 className={styles.fullName}>{fullName}</h1>
              <span className={styles.username}>@{username}</span>
            </>
          ) : (
            <h1 className={styles.fullName}>@{username}</h1>
          )}
          {bio && <p className={styles.bio}>{bio}</p>}
        </div>
      </div>

      <div className={styles.stats}>
        <Stat label="Series" value={seriesTracked} />
        <Stat label="Episodes" value={episodesWatched} />
        <Stat label="Watched" value={formatLongDuration(totalMinutes) ?? "0min"} />
        {/* <Stat label="Plan to watch" value={planToWatch} /> */}
        {/* <Stat label="Favorites" value={favorites} /> */}
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
