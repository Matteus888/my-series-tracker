import styles from "./loading.module.css";

export default function SeriesPageLoading() {
  return (
    <div className={styles.container}>
      {/* Hero */}
      <div className={styles.hero} />
      <div className={styles.heroSpacer}>
        <div className={styles.heroContent}>
          <div className={styles.skeletonTitle} />
        </div>
      </div>

      {/* Presentation : poster + infocard */}
      <div className={styles.presentation}>
        <div className={styles.topRow}>
          <div className={styles.poster} />
          <div className={styles.infoCard}>
            <div className={styles.infoBody}>
              <div className={styles.skeletonLine} style={{ width: "40%" }} />
              <div className={styles.skeletonLine} style={{ width: "70%" }} />
              <div className={styles.skeletonLine} style={{ width: "55%" }} />
              <div className={styles.genreRow}>
                {[80, 100, 70].map((w, i) => (
                  <div key={i} className={styles.genreTag} style={{ width: w }} />
                ))}
              </div>
              <div className={styles.skeletonLine} style={{ width: "100%" }} />
              <div className={styles.skeletonLine} style={{ width: "90%" }} />
              <div className={styles.skeletonLine} style={{ width: "75%" }} />
            </div>
            <div className={styles.infoFooter} />
          </div>
        </div>
      </div>
    </div>
  );
}
