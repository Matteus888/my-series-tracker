"use client";

import SearchBar from "../ui/SearchBar";
import NavBar from "./NavBar";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-light p-1 border-bottom position-sticky top-0" style={{ zIndex: 1020 }}>
      <div className="container d-flex align-items-center">
        <div className="container d-flex justify-content-start">
          <Link className="navbar-brand me-1" href="/">
            <Image src="/globe.svg" alt="Logo" width={30} height={30} />
          </Link>
          <SearchBar />
        </div>
        <NavBar />
      </div>
    </header>
  );
}
