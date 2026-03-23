import styles from "./DynamicSearchResultSkeleton.module.css";

export default function DynamicSearchResultSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.imagePlaceholder} />
        <div className={styles.infoPlaceholder}>
          <div className={styles.textLine} />
          <div className={styles.textLineShort} />
        </div>
      </div>
    </div>
  );
}
