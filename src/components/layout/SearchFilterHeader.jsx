export default function SearchFilterHeader({ query, totalResults, currentPage, totalPages, onPrevPage, onNextPage }) {
  const gutter = "1em";

  return (
    <div className="mb-4" style={{ paddingLeft: gutter }}>
      <div className="position-relative d-flex align-items-baseline gap-1 mb-1">
        {/* Flèche gauche (dans la marge) */}
        <i
          className="bi bi-caret-left-fill position-absolute search-nav-arrow"
          style={{
            left: `-${gutter}`,
            bottom: 0,
            cursor: currentPage > 1 ? "pointer" : "default",
            visibility: currentPage > 1 ? "visible" : "hidden",
            fontSize: "1rem",
          }}
          title="Previous page"
          onClick={currentPage > 1 ? onPrevPage : undefined}
        />

        <h3 className="fw-bold m-0">Search</h3>

        {/* Flèche droite */}
        <i
          className="bi bi-caret-right-fill position-relative search-nav-arrow"
          style={{
            cursor: currentPage < totalPages ? "pointer" : "default",
            visibility: currentPage < totalPages ? "visible" : "hidden",
            fontSize: "1rem",
            left: "-0.25em",
          }}
          title="Next page"
          onClick={currentPage < totalPages ? onNextPage : undefined}
        />
      </div>

      <p className="mb-1" style={{ fontSize: "0.75rem" }}>
        We found <span className="fw-bold">{totalResults}</span> results for <span className="fw-bold">{query}</span>.
      </p>

      <p className="mb-0" style={{ fontSize: "0.65rem" }}>
        You&apos;re viewing page <span className="fw-bold">{currentPage}</span> of{" "}
        <span className="fw-bold">{totalPages}</span>.
      </p>
    </div>
  );
}
