"use client";

import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light p-0">
      <div className="container-fluid">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link className="nav-link p-1" href="/dashboard">
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link p-1" href="/series">
              Series
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link p-1" href="/favorites">
              Favorites
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link p-1" href="/watchlist">
              Watchlist
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link p-1" href="/profile">
              Profile
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
