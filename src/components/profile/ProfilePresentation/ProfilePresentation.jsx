import Image from "next/image";
import Link from "next/link";
import Icon from "@mdi/react";
import {
  mdiCake,
  mdiCalendarStar,
  mdiPencil,
  mdiTelevisionClassic,
  mdiPlayCircleOutline,
  mdiClockOutline,
} from "@mdi/js";
import { formatLongDuration } from "@/lib/utils/duration.utils";
import styles from "./ProfilePresentation.module.css";

const formatDate = (isoStr) => {
  if (!isoStr) return null;
  return new Date(isoStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const computeAge = (isoStr) => {
  if (!isoStr) return null;
  const birth = new Date(isoStr);
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

export default function ProfilePresentation({ profile, stats }) {
  const { username, firstname, lastname, profilePicture, bio, birthDate, createdAt, isOwner } = profile;

  const fullName = [firstname, lastname].filter(Boolean).join(" ");
  const age = computeAge(birthDate);
  const memberSince = createdAt ? new Date(createdAt).getFullYear() : null;
  const initial = (username?.[0] ?? "?").toUpperCase();

  return (
    <div className={styles.presentation}>
      <div className={styles.topRow}>
        {/* Avatar */}
        <div className={styles.avatarWrapper}>
          {profilePicture ? (
            <Image src={profilePicture} alt={username} width={300} height={300} className={styles.avatar} priority />
          ) : (
            <div className={styles.avatarPlaceholder}>{initial}</div>
          )}
        </div>

        {/* Infos */}
        <div className={styles.infoWrapper}>
          <div className={styles.info}>
            {/* Header : username + bouton edit */}
            <div className={styles.headerRow}>
              <div className={styles.identity}>
                <h1 className={styles.username}>@{username}</h1>
                {fullName && <p className={styles.fullName}>{fullName}</p>}
              </div>
              {isOwner && (
                <Link href="/settings" className={styles.editButton}>
                  <Icon path={mdiPencil} size={0.8} />
                </Link>
              )}
            </div>

            {/* Stats row */}
            <div className={styles.statsRow}>
              <span className={styles.statItem}>
                <Icon path={mdiTelevisionClassic} size={0.8} />
                <strong>{stats.seriesTracked ?? 0}</strong> series
              </span>
              <span className={styles.statItem}>
                <Icon path={mdiPlayCircleOutline} size={0.8} />
                <strong>{stats.episodesWatched ?? 0}</strong> episodes
              </span>
              <span className={styles.statItem}>
                <Icon path={mdiClockOutline} size={0.8} />
                <strong>{formatLongDuration(stats.totalMinutes) ?? "0min"}</strong> watched
              </span>
            </div>

            {/* Bio info (naissance, member since) */}
            <div className={styles.bioInfoBlock}>
              {birthDate && (
                <div className={styles.bioInfoLine}>
                  <Icon path={mdiCake} size={0.8} />
                  <span>
                    {formatDate(birthDate)}
                    {age != null && <span className={styles.ageSuffix}> ({age} years old)</span>}
                  </span>
                </div>
              )}
              {memberSince && (
                <div className={styles.bioInfoLine}>
                  <Icon path={mdiCalendarStar} size={0.8} />
                  <span>Member since {memberSince}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {bio && (
              <div className={styles.biography}>
                <p>{bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
