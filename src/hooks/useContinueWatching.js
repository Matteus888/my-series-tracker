"use client";

import { useState, useEffect, useCallback } from "react";

export function useContinueWatching() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/continue-watching");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setItems(data.continueWatching);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const checkEpisode = useCallback(
    async (getSeriesDetails, episodeId) => {
      const previous = items;

      setItems((current) =>
        current
          .map((item) => {
            if (item.seriesId !== seriesId) return item;

            const newWatchedCount = item.watchedCount + 1;

            if (newWatchedCount >= item.totalCount) return null;

            return {
              ...item,
              watchedCount: newWatchedCount,
              nextEpisode: null,
            };
          })
          .filter(Boolean),
      );

      try {
        const response = await fetch(`/api/episodes/${episodeId}/watched`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watched: true }),
        });
        if (!response.ok) throw new Error("Failed to mark episode as watched");

        const refreshed = await fetch("/api/dashboard/continue-watching");
        if (!refreshed.ok) throw new Error("Failed to refresh");
        const data = await refreshed.json();
        setItems(data.continueWatching);
      } catch (err) {
        setItems(previous);
        setError(err.message);
      }
    },
    [items],
  );

  return { items, loading, error, checkEpisode };
}
