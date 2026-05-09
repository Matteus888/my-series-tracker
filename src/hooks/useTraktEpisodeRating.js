"use client";

import { useEffect, useState } from "react";

const cache = new Map();

export function useTraktEpisodeRating(episodeId) {
  // État local pour les fetchs en cours.
  // Quand episodeId change, on reset via la "key" du useState (en passant la dépendance).
  const [fetched, setFetched] = useState(null);

  // Calcul synchrone pendant le rendu :
  // - si pas d'episodeId : rien
  // - si dans le cache : on lit le cache
  // - sinon : null en attendant le fetch
  const cached = episodeId ? cache.get(episodeId) : null;
  const data = cached?.data ?? (fetched?.episodeId === episodeId ? fetched.data : null);
  const loading = !!episodeId && !cached && fetched?.episodeId !== episodeId;

  useEffect(() => {
    if (!episodeId) return;
    if (cache.has(episodeId)) return;

    let cancelled = false;

    fetch(`/api/episodes/${episodeId}/trakt-rating`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled) return;
        cache.set(episodeId, { data: json });
        setFetched({ episodeId, data: json });
      })
      .catch(() => {
        if (cancelled) return;
        cache.set(episodeId, { data: null });
        setFetched({ episodeId, data: null });
      });

    return () => {
      cancelled = true;
    };
  }, [episodeId]);

  return { data, loading };
}
