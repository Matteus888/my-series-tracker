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
        <li className={styles.navItem}>
          <Link className={`${styles.navLink} ${isActive("/dashboard") ? styles.active : ""}`} href="/dashboard">
            Dashboard
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link className={`${styles.navLink} ${isActive("/series") ? styles.active : ""}`} href="/series">
            Series
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link className={`${styles.navLink} ${isActive("/favorites") ? styles.active : ""}`} href="/favorites">
            Favorites
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link className={`${styles.navLink} ${isActive("/watchlist") ? styles.active : ""}`} href="/watchlist">
            Watchlist
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link className={`${styles.navLink} ${isActive("/profile") ? styles.active : ""}`} href="/profile">
            Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
}
