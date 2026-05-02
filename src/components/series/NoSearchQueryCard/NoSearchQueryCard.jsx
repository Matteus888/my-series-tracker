import Icon from "@mdi/react";
import { mdiMagnify } from "@mdi/js";
import styles from "./NoSearchQueryCard.module.css";

export default function NoSearchQueryCard({ hasQuery = false }) {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper}>
        <Icon path={mdiMagnify} size={1.4} />
      </div>
      <div className={styles.content}>
        <span className={styles.label}>{hasQuery ? "No result found" : "Start your search"}</span>
        <span className={styles.subtitle}>
          {hasQuery ? "Try another title or keyword" : "Type a series title in the search bar"}
        </span>
      </div>
    </div>
  );
}
