"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="navbar navbar-expand-lg navbar-light p-0">
      <div className="container-fluid">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link
              className="nav-link p-1"
              style={pathname === "/dashboard" ? { color: "var(--check)" } : {}}
              href="/dashboard"
            >
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className="nav-link p-1"
              style={pathname === "/series" ? { color: "var(--check)" } : {}}
              href="/series"
            >
              Series
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className="nav-link p-1"
              style={pathname === "/favorites" ? { color: "var(--check)" } : {}}
              href="/favorites"
            >
              Favorites
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className="nav-link p-1"
              style={pathname === "/watchlist" ? { color: "var(--check)" } : {}}
              href="/watchlist"
            >
              Watchlist
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className="nav-link p-1"
              style={pathname === "/profile" ? { color: "var(--check)" } : {}}
              href="/profile"
            >
              Profile
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
