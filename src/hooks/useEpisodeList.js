"use client";

import { useState, useCallback, useEffect } from "react";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import { useAuthGuard } from "./useAuthGuard";
import { useToast } from "@/context/ToastContext";

export function useEpisodeList(initialProgress, tmdbId, serieData) {
  const [episodes, setEpisodes] = useState(initialProgress);
  const [isTracking, setIsTracking] = useState(false);
  const { refresh, removeSeries, addSeriesOptimistic, isTracked, progressMap } = useTrackedSeries();
  const { requireAuth } = useAuthGuard();
  const { showToast } = useToast();

  useEffect(() => {
    setEpisodes(initialProgress);
  }, [initialProgress]);

  const tracked = isTracked(tmdbId);
  const progressEntry = progressMap?.[String(tmdbId)];
  const watchedSignature = progressEntry ? `${progressEntry.watchedCount}/${progressEntry.totalCount}` : "untracked";

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    const fetchFreshEpisodes = async () => {
      try {
        if (!tracked) {
          // Série untracked depuis ailleurs : décocher tous les épisodes localement
          if (!cancelled) {
            setEpisodes((prev) => prev.map((ep) => ({ ...ep, watched: false, watchedAt: null })));
          }
          return;
        }

        const res = await fetch(`/api/series/${tmdbId}/progress`);
        if (!res.ok) return;
        const { episodes: fresh } = await res.json();
        if (!cancelled && Array.isArray(fresh)) setEpisodes(fresh);
      } catch (err) {
        console.error("Failed to refetch episodes:", err.message);
      }
    };

    fetchFreshEpisodes();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracked, watchedSignature, tmdbId]);

  const toggleEpisode = useCallback(
    async (episodeId, currentWatched, seasonNumber, episodeNumber) => {
      const serieIsTracked = isTracked(tmdbId);

      if (!serieIsTracked) {
        const authed = requireAuth(() => {});
        if (!authed) return;

        if (isTracking) return;
        setIsTracking(true);

        try {
          // 1. Tracker la série
          const trackRes = await fetch("/api/series/tracked", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ seriesId: tmdbId, serieData, status: "watching" }),
          });
          if (!trackRes.ok) throw new Error("Failed to track series");

          const trackData = await trackRes.json();

          // 2. Mise à jour optimiste immédiate du contexte
          const newTracked = trackData.trackedSeries[trackData.trackedSeries.length - 1];
          addSeriesOptimistic(newTracked);
          showToast(`${serieData.name} added to watched shows ✓`);

          // 3. Récupérer les vrais _id depuis la base
          const progressRes = await fetch(`/api/series/${tmdbId}/progress`);
          if (!progressRes.ok) throw new Error("Failed to fetch progress");
          const { episodes: freshEpisodes } = await progressRes.json();

          setEpisodes(freshEpisodes);

          // 4. Trouver le _id de l'épisode ciblé et le cocher
          const target = freshEpisodes.find(
            (ep) => ep.seasonNumber === seasonNumber && ep.episodeNumber === episodeNumber,
          );
          if (!target) return;

          // Optimistic update
          setEpisodes((prev) =>
            prev.map((ep) =>
              ep._id === target._id ? { ...ep, watched: true, watchedAt: new Date().toISOString() } : ep,
            ),
          );

          // 5. Cocher l'épisode
          const watchRes = await fetch(`/api/episodes/${target._id}/watched`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ watched: true }),
          });
          if (!watchRes.ok) throw new Error("Failed to mark episode");

          // 6. Refresh pour données complètes
          await refresh();
        } catch (err) {
          console.error(err);
          setEpisodes(initialProgress.map((ep) => ({ ...ep, watched: false, watchedAt: null })));
          showToast("Could not start tracking this series", "error");
        } finally {
          setIsTracking(false);
        }
        return;
      }

      // Comportement normal — série déjà trackée
      const newWatched = !currentWatched;
      const updatedEpisodes = episodes.map((ep) =>
        ep._id && ep._id.toString() === episodeId.toString()
          ? { ...ep, watched: newWatched, watchedAt: newWatched ? new Date().toISOString() : null }
          : ep,
      );
      setEpisodes(updatedEpisodes);

      try {
        const response = await fetch(`/api/episodes/${episodeId}/watched`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watched: newWatched }),
        });
        if (!response.ok) throw new Error("Failed");

        const noneWatched = updatedEpisodes.every((ep) => !ep.watched);
        if (noneWatched) {
          await removeSeries(tmdbId);
          // Reset visuel — les épisodes restent affichés mais décochés
          setEpisodes((prev) => prev.map((ep) => ({ ...ep, watched: false, watchedAt: null })));
        } else {
          await refresh();
        }
      } catch {
        setEpisodes((prev) =>
          prev.map((ep) =>
            ep._id && ep._id.toString() === episodeId.toString() ? { ...ep, watched: currentWatched } : ep,
          ),
        );
        showToast(currentWatched ? "Could not unmark episode" : "Could not mark episode as watched", "error");
      }
    },
    [
      episodes,
      isTracking,
      tmdbId,
      serieData,
      initialProgress,
      refresh,
      removeSeries,
      addSeriesOptimistic,
      isTracked,
      showToast,
      requireAuth,
    ],
  );

  const seasons = episodes.reduce((acc, ep) => {
    const s = ep.seasonNumber;
    if (!acc[s]) acc[s] = [];
    acc[s].push(ep);
    return acc;
  }, {});

  return { seasons, toggleEpisode, isTracking };
}
