"use client";

import styles from "../shared/settings.module.css";
import AccountAvatarSection from "./AccountAvatarSection";
import AccountInfoForm from "./AccountInfoForm";
import AccountPasswordForm from "./AccountPasswordForm";

export default function AccountTab({ session }) {
  return (
    <div className={styles.section}>
      <AccountAvatarSection session={session} />

      <div className={styles.divider} />

      <AccountInfoForm session={session} />

      <div className={styles.divider} />

      <AccountPasswordForm />
    </div>
  );
}
