import styles from "./SerieCardSkeleton.module.css";

export default function SerieCardSkeleton() {
  return (
    <div className={`tooltip-wrapper ${styles.container}`}>
      <div className="tooltip" style={{ visibility: "hidden" }}>
        Loading...
      </div>
      <div className={`card ${styles.card}`}>
        <div className={styles.imageContainer}>
          <div className={styles.imagePlaceholder}></div>
          <span className={styles.yearBadgePlaceholder}></span>
        </div>
        <div className={styles.footer}>
          <div className={styles.buttonsContainer}>
            <div className={styles.button}></div>
            <div className={styles.button}></div>
            <div className={styles.button}></div>
          </div>
          <div className={styles.infoContainer}>
            <div className={styles.heartRatingPlaceholder}></div>
            <div className={styles.ratingPlaceholder}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
