export default function Footer() {
  return (
    <footer
      className=""
      style={{
        backgroundColor: "var(--card-bg)",
        padding: "0.5rem 0.85rem",
        fontSize: "0.9rem",
        color: "var(--foreground)",
      }}
    >
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
        {/* Texte gauche */}
        <span className="mb-1 mb-md-0">© {new Date().getFullYear()} MySeriesTracker</span>

        {/* Liens droite */}
        <div>
          <a href="/about" className="text-light text-decoration-none me-3">
            About
          </a>
          <a href="/contact" className="text-light text-decoration-none me-3">
            Contact
          </a>
          <a href="/privacy" className="text-light text-decoration-none">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
