import styles from "./Pagination.module.css";
import Link from "next/link";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const handlePrevious = (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    let startPage, endPage;

    if (totalPages <= 9) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= 7) {
        startPage = 1;
        endPage = 9;
      } else if (currentPage + 4 >= totalPages) {
        startPage = totalPages - 6;
        endPage = totalPages;
      } else {
        startPage = currentPage - 4;
        endPage = currentPage + 4;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (startPage > 1) {
      pageNumbers.unshift("...");
    }
    if (endPage < totalPages) {
      pageNumbers.push("...");
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={styles.container}>
      <Link
        href="#"
        className={`${styles.link} ${currentPage === 1 ? styles.linkDisabled : ""}`}
        onClick={handlePrevious}
        aria-disabled={currentPage === 1}
      >
        <span className={styles.arrowIcon}>←</span>
        <span className={styles.linkText}>Previous page</span>
      </Link>
      <div className={styles.pagesContainer}>
        {pageNumbers.map((pageNumber, index) =>
          pageNumber === "..." ? (
            <span key={index} className={styles.ellipsis}>
              ···
            </span>
          ) : (
            <Link
              key={index}
              href="#"
              className={`${styles.link} ${currentPage === pageNumber ? `${styles.linkActive} ${styles.pageNumber}` : ""}`}
              onClick={(e) => {
                e.preventDefault();
                onPageChange(pageNumber);
              }}
            >
              <span className={styles.linkText}>{pageNumber}</span>
            </Link>
          ),
        )}
      </div>
      <Link
        href="#"
        className={`${styles.link} ${currentPage === totalPages ? styles.linkDisabled : ""}`}
        onClick={handleNext}
        aria-disabled={currentPage === totalPages}
      >
        <span className={styles.linkText}>Next page</span>
        <span className={styles.arrowIcon}>→</span>
      </Link>
    </div>
  );
}
