"use client";

import styles from "./Header.module.css";
import SearchBar from "../ui/SearchBar";
import NavBar from "./NavBar";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.leftContainer}>
        <Link className={styles.logoLink} href="/">
          <Image src="/logo10.png" alt="Logo" width={42} height={35} className={styles.logo} />
        </Link>
        <SearchBar />
      </div>
      <NavBar />
    </header>
  );
}
