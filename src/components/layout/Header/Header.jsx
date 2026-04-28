"use client";

import styles from "./Header.module.css";
import Logo from "@/components/ui/Logo/Logo";
import SearchBar from "@/components/ui/SearchBar/SearchBar";
import NavBar from "@/components/layout/NavBar/NavBar";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import Link from "next/link";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.leftContainer}>
        <Link className={styles.logoLink} href="/">
          <Logo size={35} animated />
        </Link>
        <SearchBar />
      </div>
      <div className={styles.rightContainer}>
        <NavBar />
        <ProfileMenu />
      </div>
    </header>
  );
}
