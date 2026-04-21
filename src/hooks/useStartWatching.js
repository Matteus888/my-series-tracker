"use client";

import { useState, useEffect, useCallback } from "react";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import { useToast } from "@/context/ToastContext";
import { useList } from "@/context/ListContext";

export function useStartWatching() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingId, setCheckingId] = useState(null);

  const { addSeriesOptimistic, refresh } = useTrackedSeries();
  const { showToast } = useToast();
  const { lists, refresh: refreshLists } = useList();

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/start-watching");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setItems(data.startWatching ?? null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [lists, fetchData]);

  const checkFirstEpisode = useCallback(
    async (item, mode = "first") => {
      if (checkingId) return;
      setCheckingId(item.seriesId);
      setItems((prev) => prev.filter((i) => i.seriesId !== item.seriesId));

      try {
        const trackResponse = await fetch("/api/series/tracked", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            seriesId: item.tmdbId,
            serieData: {
              name: item.title,
              poster_path: item.posterPath,
            },
            status: mode === "all" ? "completed" : "watching",
            markFirstWatched: mode === "first",
            markAllWatched: mode === "all",
          }),
        });
        if (!trackResponse.ok) throw new Error("Failed to track series");

        const trackData = await trackResponse.json();
        const newTracked = trackData.trackedSeries[trackData.trackedSeries.length - 1];
        addSeriesOptimistic(newTracked);

        const watchlist = lists.find((l) => l.isDefault);
        if (watchlist && item.firstEpisode) {
          await fetch(`/api/lists/${watchlist._id}/series`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ seriesId: item.seriesId }),
          });
          await refreshLists();
        }

        showToast(`${item.title} added to watched shows ✓`);
        await refresh();
      } catch (err) {
        console.error(err);
        setItems((prev) => [...prev, item]);
        showToast("An error occured", "error");
      } finally {
        setCheckingId(null);
      }
    },
    [checkingId, addSeriesOptimistic, refresh, showToast, lists, refreshLists],
  );

  return { items, loading, error, checkFirstEpisode, checkingId };
}
