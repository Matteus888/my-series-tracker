"use client";

import { useState, useCallback, useEffect } from "react";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import { useToast } from "@/context/ToastContext";
import { useAuthGuard } from "./useAuthGuard";

export function useEpisodeWatchToggle({ episodeId, initialWatched, seriesTmdbId, seriesTitle, seriesData }) {
  const [watched, setWatched] = useState(initialWatched);
  const [isPending, setIsPending] = useState(false);
  const { isTracked, addSeriesOptimistic, refresh, incrementWatched, progressMap } = useTrackedSeries();
  const { showToast } = useToast();
  const { requireAuth } = useAuthGuard();

  // Synchronise l'état watched avec la base quand le context signale un changement
  // (par exemple un toggle déclenché depuis le carousel, EpisodeList, etc.)
  const tracked = isTracked(seriesTmdbId);
  const progressEntry = progressMap?.[String(seriesTmdbId)];
  const watchedSignature = progressEntry ? `${progressEntry.watchedCount}/${progressEntry.totalCount}` : "untracked";

  useEffect(() => {
    if (typeof window === "undefined" || !episodeId) return;
    if (isPending) return;

    let cancelled = false;
    const fetchFresh = async () => {
      try {
        if (!tracked) {
          if (!cancelled) setWatched(false);
          return;
        }
        const res = await fetch(`/api/series/${seriesTmdbId}/progress`);
        if (!res.ok) return;

        const { episodes: fresh } = await res.json();
        if (cancelled || !Array.isArray(fresh)) return;

        const target = fresh.find((ep) => ep._id?.toString() === episodeId.toString());
        if (target) setWatched(target.watched ?? false);
      } catch (err) {
        console.error("Failed to sync episode watched state:", err.message);
      }
    };

    fetchFresh();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracked, watchedSignature, seriesTmdbId, episodeId]);

  const toggle = useCallback(async () => {
    if (isPending) return;

    const willWatch = !watched;
    const serieIsTracked = isTracked(seriesTmdbId);

    if (!serieIsTracked && willWatch) {
      const authed = requireAuth(() => {});
      if (!authed) return;

      setIsPending(true);
      setWatched(true);

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

        incrementWatched();
        await refresh();
      } catch (err) {
        setWatched(false);
        showToast("Could not mark episode as watched", "error");
      } finally {
        setIsPending(false);
      }
      return;
    }

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
