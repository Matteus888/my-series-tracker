"use client";

export default function Error({ error, reset }) {
  return (
    <div style={{ padding: "3rem", textAlign: "center" }}>
      <h1>Une erreur est survenue</h1>
      <button onClick={() => reset()}>Réessayer</button>
    </div>
  );
}
