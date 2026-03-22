import styles from "./SearchFilterHeader.module.css";

export default function SearchFilterHeader({ query, totalResults, currentPage, totalPages, onPrevPage, onNextPage }) {
  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        {/* Flèche gauche (dans la marge) */}
        <span
          className={`${styles.navArrow} ${styles.leftArrow} ${currentPage <= 1 ? styles.disabledArrow : ""}`}
          onClick={currentPage > 1 ? onPrevPage : undefined}
          title="Previous page"
        >
          ◀
        </span>

        <h3 className={styles.title}>Search</h3>

        {/* Flèche droite */}
        <span
          className={`${styles.navArrow} ${styles.rightArrow} ${currentPage >= totalPages ? styles.disabledArrow : ""}`}
          title="Next page"
          onClick={currentPage < totalPages ? onNextPage : undefined}
        >
          ▶
        </span>
      </div>

      <p className={styles.resultsText}>
        We found <span className={styles.bold}>{totalResults}</span> results for{" "}
        <span className={styles.bold}>{query}</span>.
      </p>

      <p className={styles.paginationText}>
        You&apos;re viewing page <span className={styles.bold}>{currentPage}</span> of{" "}
        <span className={styles.bold}>{totalPages}</span>.
      </p>
    </div>
  );
}
