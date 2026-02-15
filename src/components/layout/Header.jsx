"use client";

import SearchBar from "../ui/SearchBar";
import NavBar from "./NavBar";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header
      className="position-sticky top-0 w-100"
      style={{
        zIndex: 1020,
        background: `
          linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)),
          rgba(var(--card-bg-rgb), 0.6)
        `,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: "0.5rem 0",
        borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
        height: "50px",
      }}
    >
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center ms-3">
          <Link className="navbar-brand me-3" href="/">
            <Image src="/logo.png" alt="Logo" width={30} height={30} />
          </Link>
          <SearchBar />
        </div>
        <NavBar />
      </div>
    </header>
  );
}
