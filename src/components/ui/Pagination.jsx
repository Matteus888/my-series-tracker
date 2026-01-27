export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
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
    <div className="d-flex justify-content-between align-items-center my-4 w-100 px-3">
      <button
        className="btn btn-outline-secondary d-flex align-items-center gap-1"
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        <i className="bi bi-arrow-left"></i>
        <span>Previous page</span>
      </button>
      <div className="d-flex gap-2">
        {pageNumbers.map((pageNumber, index) =>
          pageNumber === "..." ? (
            <span key={index} className="text-secondary">
              ...
            </span>
          ) : (
            <button
              key={index}
              className={`btn ${currentPage === pageNumber ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          ),
        )}
      </div>
      <button
        className="btn btn-outline-secondary d-flex align-items-center gap-1"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        <i className="bi bi-arrow-right"></i>
        <span>Next page</span>
      </button>
    </div>
  );
}
