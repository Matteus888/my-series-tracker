"use client";

import { useState, useEffect } from "react";

export function useSimilarSeries(tmdbId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tmdbId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/series/${tmdbId}/similar`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        if (!cancelled) setItems(data.items ?? []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [tmdbId]);

  return { items, loading, error };
}
