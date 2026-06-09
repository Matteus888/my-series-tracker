"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import { useToast } from "@/context/ToastContext";

export function useContinueWatching() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { trackedSeries, incrementWatched, watchedCount, updateSeries } = useTrackedSeries();
  const { showToast } = useToast();

  // Préserve l'ordre visuel courant lors d'un refresh (ex: après un check)
  const orderRef = useRef(null);

  const applyPreservedOrder = useCallback((freshItems) => {
    if (!orderRef.current) {
      orderRef.current = new Map(freshItems.map((it, i) => [it.seriesId, i]));
      return freshItems;
    }
    const previousOrder = orderRef.current;
    const sorted = [...freshItems].sort((a, b) => {
      const ai = previousOrder.has(a.seriesId) ? previousOrder.get(a.seriesId) : Infinity;
      const bi = previousOrder.has(b.seriesId) ? previousOrder.get(b.seriesId) : Infinity;
      if (ai !== bi) return ai - bi;
      return freshItems.indexOf(a) - freshItems.indexOf(b);
    });
    orderRef.current = new Map(sorted.map((it, i) => [it.seriesId, i]));
    return sorted;
  }, []);

  useEffect(() => {
    orderRef.current = null;
  }, [trackedSeries]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/continue-watching");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setItems(applyPreservedOrder(data.continueWatching));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [trackedSeries, watchedCount, applyPreservedOrder]);

  const checkEpisode = useCallback(
    async (seriesId, episodeId) => {
      const previous = items;
      const target = items.find((item) => item.seriesId === seriesId);
      const seriesTitle = target?.title;
      let willComplete = false;

      setItems((current) =>
        current
          .map((item) => {
            if (item.seriesId !== seriesId) return item;

            const newWatchedCount = item.watchedCount + 1;

            if (newWatchedCount >= item.totalCount) {
              willComplete = true;
              return null;
            }

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

        incrementWatched();

        const data = await refreshed.json();
        setItems(applyPreservedOrder(data.continueWatching));

        if (willComplete && seriesTitle) {
          showToast(`You finished ${seriesTitle}! 🍿`);
        }
      } catch (err) {
        setItems(previous);
        setError(err.message);
        showToast("Could not mark episode as watched", "error");
      }
    },
    [items, incrementWatched, applyPreservedOrder, showToast],
  );

  const dropSeries = useCallback(
    (seriesId) => {
      const target = items.find((item) => item.seriesId === seriesId);
      if (!target) return;

      const previous = items;
      // Optimistic UI : la série disparaît immédiatement
      setItems((current) => current.filter((item) => item.seriesId !== seriesId));

      try {
        // updateSeries gère le toast "Marked as dropped" et le refetch
        updateSeries(target.tmdbId, { status: "dropped" });
      } catch (err) {
        setItems(previous);
        setError(err.message);
      }
    },
    [items, updateSeries],
  );

  return { items, loading, error, checkEpisode, dropSeries };
}
