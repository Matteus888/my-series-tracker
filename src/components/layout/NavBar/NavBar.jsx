"use client";

import styles from "./NavBar.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <nav className={styles.navContainer}>
      <ul className={styles.navList}>
        <li>
          <Link className={`${styles.navLink} ${isActive("/dashboard") ? styles.active : ""}`} href="/dashboard">
            <span className={styles.navText}>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link className={`${styles.navLink} ${isActive("/series") ? styles.active : ""}`} href="/series">
            <span className={styles.navText}>Series</span>
          </Link>
        </li>
        <li>
          <Link className={`${styles.navLink} ${isActive("/favorites") ? styles.active : ""}`} href="/favorites">
            <span className={styles.navText}>Favorites</span>
          </Link>
        </li>
        <li>
          <Link className={`${styles.navLink} ${isActive("/watchlist") ? styles.active : ""}`} href="/watchlist">
            <span className={styles.navText}>Watchlist</span>
          </Link>
        </li>
        <li>
          <Link className={`${styles.navLink} ${isActive("/profile") ? styles.active : ""}`} href="/profile">
            <span className={styles.navText}>Profile</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
