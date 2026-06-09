import styles from "./loading.module.css";

export default function UserProfileLoading() {
  return (
    <div className={styles.container}>
      {/* ProfileHero */}
      <div className={styles.hero} />

      {/* ProfilePresentation : nom + stats */}
      <div className={styles.section}>
        <div className={styles.presentationCard}>
          <div className={styles.skeletonName} />
          <div className={styles.skeletonSub} />
          <div className={styles.statsRow}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.statBlock} />
            ))}
          </div>
        </div>
      </div>

      {/* Sections empilées */}
      {[160, 320, 200, 300].map((h, i) => (
        <div key={i} className={styles.section}>
          <div className={styles.sectionHeader} />
          <div className={styles.sectionBody} style={{ height: h }} />
        </div>
      ))}
    </div>
  );
}
