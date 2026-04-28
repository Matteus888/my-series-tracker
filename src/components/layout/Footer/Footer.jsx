import styles from "./Footer.module.css";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        {/* Texte gauche */}
        <span>© {new Date().getFullYear()} MySeriesTracker</span>

        {/* Liens droite */}
        <div className={styles.links}>
          <Link href="/about" className={styles.link}>
            <span className={styles.linkText}>About</span>
          </Link>
          <Link href="/contact" className={styles.link}>
            <span className={styles.linkText}>Contact</span>
          </Link>
          <Link href="/privacy" className={styles.link}>
            <span className={styles.linkText}>Privacy</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
