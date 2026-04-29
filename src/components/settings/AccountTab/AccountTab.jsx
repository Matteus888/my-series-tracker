"use client";

import styles from "./AccountTab.module.css";
import AccountAvatarSection from "./AccountAvatarSection";
import AccountInfoForm from "./AccountInfoForm";
import AccountPasswordForm from "./AccountPasswordForm";

export default function AccountTab({ session }) {
  return (
    <div className={styles.grid}>
      <div className={`${styles.card} ${styles.cardFull}`}>
        <AccountAvatarSection session={session} />
      </div>
      <div className={styles.card}>
        <AccountInfoForm session={session} />
      </div>
      <div className={styles.card}>
        <AccountPasswordForm />
      </div>
    </div>
  );
}
