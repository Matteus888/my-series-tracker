"use client";

import { useState, useCallback } from "react";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import { useToast } from "@/context/ToastContext";
import { useAuthGuard } from "./useAuthGuard";

export function useEpisodeWatchToggle({ episodeId, initialWatched, seriesTmdbId, seriesTitle, seriesData }) {
  const [watched, setWatched] = useState(initialWatched);
  const [isPending, setIsPending] = useState(false);
  const { isTracked, addSeriesOptimistic, refresh, removeSeries, incrementWatched } = useTrackedSeries();
  const { showToast } = useToast();
  const { requireAuth } = useAuthGuard();

  const toggle = useCallback(async () => {
    if (isPending) return;

    const willWatch = !watched;
    const serieIsTracked = isTracked(seriesTmdbId);

    // Cas 1 : série pas trackée et on veut cocher → confirmation implicite
    // (on track + on coche dans la foulée, comme useEpisodeList)
    if (!serieIsTracked && willWatch) {
      const authed = requireAuth(() => {});
      if (!authed) return;

      const confirmed = window.confirm(
        `${seriesTitle} is not in your tracked shows. Add it and mark this episode as watched?`,
      );
      if (!confirmed) return;

      setIsPending(true);
      try {
        const trackRes = await fetch("/api/series/tracked", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            seriesId: seriesTmdbId,
            serieData: seriesData,
            status: "watching",
          }),
        });
        if (!trackRes.ok) throw new Error("Failed to track series");

        const trackData = await trackRes.json();
        const newTracked = trackData.trackedSeries[trackData.trackedSeries.length - 1];
        addSeriesOptimistic(newTracked);
        showToast(`${seriesTitle} added to watched shows ✓`);

        const watchRes = await fetch(`/api/episodes/${episodeId}/watched`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watched: true }),
        });
        if (!watchRes.ok) throw new Error("Failed to mark episode");

        setWatched(true);
        incrementWatched();
        await refresh();
      } catch (err) {
        showToast("Could not mark episode as watched", "error");
      } finally {
        setIsPending(false);
      }
      return;
    }

    // Cas 2 : série trackée OU on décoche → toggle direct
    setIsPending(true);
    setWatched(willWatch);

    try {
      const res = await fetch(`/api/episodes/${episodeId}/watched`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watched: willWatch }),
      });
      if (!res.ok) throw new Error("Failed");

      if (willWatch) incrementWatched();
      await refresh();
    } catch {
      setWatched(!willWatch);
      showToast(willWatch ? "Could not mark episode as watched" : "Could not unmark episode", "error");
    } finally {
      setIsPending(false);
    }
  }, [
    watched,
    isPending,
    isTracked,
    seriesTmdbId,
    seriesTitle,
    seriesData,
    episodeId,
    addSeriesOptimistic,
    incrementWatched,
    refresh,
    requireAuth,
    showToast,
  ]);

  return { watched, toggle, isPending };
}
