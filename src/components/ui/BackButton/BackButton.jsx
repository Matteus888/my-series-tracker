"use client";

import styles from "./BackButton.module.css";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <button onClick={() => router.back()} className={styles.backButton}>
          <span className={styles.arrowIcon}>←</span>
        </button>
      </div>
    </div>
  );
}
