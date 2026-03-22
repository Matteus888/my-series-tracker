import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        {/* Texte gauche */}
        <span>© {new Date().getFullYear()} MySeriesTracker</span>

        {/* Liens droite */}
        <div>
          <a href="/about" className={styles.link}>
            About
          </a>
          <a href="/contact" className={styles.link}>
            Contact
          </a>
          <a href="/privacy" className={styles.link}>
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
