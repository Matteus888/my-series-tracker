import type { TmdbSerie, TmdbSerieSearchResult } from "@/types/tmdb";

// Chercher une série par ID TMDB
export async function fetchSerieFromTMDB(tmdbId: number): Promise<TmdbSerie> {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${process.env.TMDB_API_KEY}&language=fr-FR`);

  if (!res.ok) throw new Error("Série introuvable sur TMDB");

  return res.json();
}

// Chercher par mot clé
export async function searchSeriesOnTMDB(query: string): Promise<TmdbSerieSearchResult[]> {
  const res = await fetch(
    `https://api.themoviedb.org/3/search/tv?api_key=${process.env.TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}`
  );

  if (!res.ok) throw new Error("Erreur lors de la recherche sur TMDB");

  const data = await res.json();
  return data.results;
}
