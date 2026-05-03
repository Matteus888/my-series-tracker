"use client";

import styles from "./Header.module.css";
import Logo from "@/components/ui/Logo/Logo";
import SearchBar from "@/components/ui/SearchBar/SearchBar";
import NavBar from "@/components/layout/NavBar/NavBar";
import ProfileMenuAvatar from "../ProfileMenuAvatar/ProfileMenuAvatar";
import Link from "next/link";
import Icon from "@mdi/react";
import { mdiMagnify } from "@mdi/js";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.leftContainer}>
        <Link className={styles.logoLink} href="/">
          <Logo size={35} animated />
        </Link>
        {/* <Icon path={mdiMagnify} size={1.35} /> */}
        <SearchBar />
      </div>
      <div className={styles.rightContainer}>
        <NavBar />
        <ProfileMenuAvatar />
      </div>
    </header>
  );
}
