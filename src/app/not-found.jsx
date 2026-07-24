"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "3rem", textAlign: "center" }}>
      <h1>404 - Page not found</h1>
      <p>Cette page n&apos;existe pas.</p>
      <Link href="/">Retour à l&apos;accueil</Link>
    </div>
  );
}
