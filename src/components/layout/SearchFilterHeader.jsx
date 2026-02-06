export default function SearchFilterHeader({ query, totalResults, currentPage, totalPages, onPrevPage, onNextPage }) {
  const gutter = "1.2em";

  return (
    <div className="mb-4" style={{ paddingLeft: gutter }}>
      {/* Ligne titre */}
      <div className="position-relative d-flex align-items-center gap-1 mb-1">
        {/* Flèche gauche (dans la marge) */}
        <i
          className="bi bi-caret-left-fill position-absolute search-nav-arrow"
          style={{
            left: `-${gutter}`,
            top: "50%",
            transform: "translateY(-50%)",
            cursor: currentPage > 1 ? "pointer" : "default",
            visibility: currentPage > 1 ? "visible" : "hidden",
            fontSize: "1.1rem",
          }}
          title="Previous page"
          onClick={currentPage > 1 ? onPrevPage : undefined}
        />

        <h3 className="fw-bold mb-0">Search</h3>

        {/* Flèche droite */}
        <i
          className="bi bi-caret-right-fill position-relative search-nav-arrow"
          style={{
            cursor: currentPage < totalPages ? "pointer" : "default",
            visibility: currentPage < totalPages ? "visible" : "hidden",
            fontSize: "1.1rem",
            top: "0.02em",
          }}
          title="Next page"
          onClick={currentPage < totalPages ? onNextPage : undefined}
        />
      </div>

      <p className="mb-1" style={{ fontSize: "0.9rem" }}>
        We found <strong>{totalResults}</strong> results for <strong>&quot;{query}&quot;</strong>.
      </p>

      <p className="mb-0" style={{ fontSize: "0.8rem" }}>
        You&apos;re viewing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>.
      </p>
    </div>
  );
}
