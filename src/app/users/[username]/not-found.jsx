import Link from "next/link";
import styles from "./not-found.module.css";
import Icon from "@mdi/react";
import { mdiAccountQuestion } from "@mdi/js";

export default function UserNotFound() {
  return (
    <main className={styles.container}>
      <Icon path={mdiAccountQuestion} size={4} className={styles.icon} />
      <h1 className={styles.title}>User not found</h1>
      <p className={styles.text}>This profile doesn&apos;t exist or is private.</p>
      <Link href="/series" className={styles.link}>
        Back to series
      </Link>
    </main>
  );
}
