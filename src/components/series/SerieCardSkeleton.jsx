import styles from "./SerieCardSkeleton.module.css";

export default function SerieCardSkeleton() {
  return (
    <div className={styles.container}>
      <div className={`card ${styles.skeletonCard}`}>
        <div className={styles.imagePlaceholder}></div>
        <div className={`card-footer ${styles.footer}`}>
          <div className={styles.buttonsContainer}>
            <div className={styles.buttonPlaceholder}></div>
            <div className={styles.buttonPlaceholder}></div>
          </div>
          <div className={styles.infoContainer}>
            <div className={`${styles.elementPlaceholder} ${styles.elementSmall}`}></div>
            <div className={`${styles.elementPlaceholder} ${styles.elementMedium}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
