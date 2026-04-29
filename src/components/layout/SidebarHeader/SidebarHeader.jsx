import styles from "./SidebarHeader.module.css";
import { RESULTS_VARIANTS } from "./variants";

export default function SidebarHeader({
  query,
  pageName,
  totalResults,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  variant = "search",
}) {
  const renderResultsText =
    RESULTS_VARIANTS[variant]?.({
      totalResults,
      query,
      styles,
    }) ?? null;

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

        <h3 className={styles.title}>{pageName}</h3>

        {/* Flèche droite */}
        <span
          className={`${styles.navArrow} ${currentPage >= totalPages ? styles.disabledArrow : ""}`}
          title="Next page"
          onClick={currentPage < totalPages ? onNextPage : undefined}
        >
          ▶
        </span>
      </div>

      <p className={styles.resultsText}>{renderResultsText}</p>

      <p className={styles.paginationText}>
        You&apos;re viewing page <span className={styles.bold}>{currentPage}</span> of{" "}
        <span className={styles.bold}>{totalPages}</span>.
      </p>
    </div>
  );
}
