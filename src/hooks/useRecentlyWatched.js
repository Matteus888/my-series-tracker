"use client";

import { useState, useEffect, useCallback } from "react";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import { useToast } from "@/context/ToastContext";

export function useRecentlyWatched() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { trackedSeries, watchedCount, incrementWatched, refresh } = useTrackedSeries();
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/recently-watched");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setItems(data.recentlyWatched ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const uncheckEpisode = useCallback(
    async (episodeId) => {
      // Optimistic — retire l'épisode de la liste
      setItems((prev) => prev.filter((item) => item._id !== episodeId));

      try {
        const response = await fetch(`/api/episodes/${episodeId}/watched`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watched: false }),
        });
        if (!response.ok) throw new Error("Failed");
        incrementWatched();
        await refresh();
      } catch {
        // Rollback
        fetchData();
        showToast("Could not unmark episode", "error");
      }
    },
    [fetchData, incrementWatched, refresh, showToast],
  );

  useEffect(() => {
    fetchData();
  }, [trackedSeries, watchedCount, fetchData]);

  return { items, loading, error, uncheckEpisode };
}
