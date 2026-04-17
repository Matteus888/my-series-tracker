import styles from "./ProfileHeader.module.css";
import Image from "next/image";

export default function ProfileHeader({ username, profilePicture }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.avatarWrapper}>
        <Image
          src={profilePicture || "https://api.dicebear.com/7.x/initials/svg?seed=" + username}
          alt={`${username}'s avatar`}
          width={80}
          height={80}
          loading="eager"
          className={styles.avatar}
          priority
        />
      </div>
      <div className={styles.info}>
        <h1 className={styles.username}>{username}</h1>
      </div>
    </div>
  );
}
