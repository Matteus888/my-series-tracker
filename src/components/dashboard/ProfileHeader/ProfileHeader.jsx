import styles from "./ProfileHeader.module.css";
import Image from "next/image";

export default function ProfileHeader({ username, profilePicture }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.avatarWrapper}>
        <Image
          src={profilePicture || "/images/default-profile.png"}
          alt={`${username}'s avatar`}
          width={80}
          height={80}
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
