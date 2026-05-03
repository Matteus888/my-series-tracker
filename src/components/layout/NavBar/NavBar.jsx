"use client";

import styles from "./NavBar.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function NavBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isActive = (path) => pathname === path;

  // Evite un flash pdt la résolution de la session
  if (status === "loading") return <nav className={styles.navContainer} />;

  return (
    <nav className={styles.navContainer}>
      <ul className={styles.navList}>
        {session ? (
          <>
            {/* <li>
              <Link className={`${styles.navLink} ${isActive("/dashboard") ? styles.active : ""}`} href="/dashboard">
                <span className={styles.navText}>Dashboard</span>
              </Link>
            </li> */}
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
              <Link className={`${styles.navLink} ${isActive("/watching") ? styles.active : ""}`} href="/watching">
                <span className={styles.navText}>Watching</span>
              </Link>
            </li>
            <li>
              <Link className={`${styles.navLink} ${isActive("/lists") ? styles.active : ""}`} href="/lists">
                <span className={styles.navText}>Lists</span>
              </Link>
            </li>
            <li>
              <Link className={`${styles.navLink} ${isActive("/history") ? styles.active : ""}`} href="/history">
                <span className={styles.navText}>History</span>
              </Link>
            </li>
            <li>
              <Link className={`${styles.navLink} ${isActive("/calendar") ? styles.active : ""}`} href="/calendar">
                <span className={styles.navText}>Calendar</span>
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link className={`${styles.navLink} ${isActive("/series") ? styles.active : ""}`} href="/series">
                <span className={styles.navText}>Series</span>
              </Link>
            </li>
            <li>
              <Link className={`${styles.navLink} ${isActive("/login") ? styles.active : ""}`} href="/login">
                <span className={styles.navText}>Log in</span>
              </Link>
            </li>
            <li>
              <Link className={`${styles.navLink} ${isActive("/signup") ? styles.active : ""}`} href="/signup">
                <span className={styles.navText}>Sign up</span>
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
