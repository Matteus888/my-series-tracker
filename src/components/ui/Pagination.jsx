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
      if (currentPage <= 5) {
        startPage = 1;
        endPage = 7;
      } else if (currentPage + 4 >= totalPages) {
        startPage = totalPages - 6;
        endPage = totalPages;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
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
    <div
      className="d-flex justify-content-between align-items-center w-100"
      style={{ height: "40px", fontSize: "0.8rem" }}
    >
      <Link
        href="#"
        className={`pagination-link ${currentPage === 1 ? "pagination-link-disabled" : ""}`}
        onClick={handlePrevious}
        aria-disabled={currentPage === 1}
      >
        <i className="bi bi-arrow-left"></i>
        <span>Previous page</span>
      </Link>
      <div className="d-inline-flex gap-1 h-100 align-items-center">
        {pageNumbers.map((pageNumber, index) =>
          pageNumber === "..." ? (
            <span key={index} className="pagination-ellipsis">
              ···
            </span>
          ) : (
            <Link
              key={index}
              href="#"
              className={`pagination-link ${currentPage === pageNumber ? "pagination-link-active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                onPageChange(pageNumber);
              }}
            >
              {pageNumber}
            </Link>
          ),
        )}
      </div>
      <Link
        href="#"
        className={`pagination-link ${currentPage === totalPages ? "pagination-link-disabled" : ""}`}
        onClick={handleNext}
        aria-disabled={currentPage === totalPages}
      >
        <span>Next page</span>
        <i className="bi bi-arrow-right"></i>
      </Link>
    </div>
  );
}
