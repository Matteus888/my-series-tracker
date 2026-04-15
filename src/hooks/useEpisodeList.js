"use client";

import { useState, useCallback } from "react";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";

export function useEpisodeList(initialProgress, tmdbId, serieData) {
  const [episodes, setEpisodes] = useState(initialProgress);
  const [isTracking, setIsTracking] = useState(false);
  const { refresh } = useTrackedSeries();

  const toggleEpisode = useCallback(
    async (episodeId, currentWatched, seasonNumber, episodeNumber) => {
      // Série non trackée — on tracke, on récupère les _id, on coche
      if (!episodeId) {
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

          await refresh();

          // 2. Récupérer les vrais _id depuis la base
          const progressRes = await fetch(`/api/series/${tmdbId}/progress`);
          if (!progressRes.ok) throw new Error("Failed to fetch progress");
          const { episodes: freshEpisodes } = await progressRes.json();

          // 3. Mettre à jour le state avec les vrais _id
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
        } catch (err) {
          console.error(err);
          // Rollback — on remet les épisodes sans _id
          setEpisodes(initialProgress);
        } finally {
          setIsTracking(false);
        }
        return;
      }

      // Comportement normal — série déjà trackée
      const newWatched = !currentWatched;
      setEpisodes((prev) =>
        prev.map((ep) =>
          ep._id && ep._id.toString() === episodeId.toString()
            ? { ...ep, watched: newWatched, watchedAt: newWatched ? new Date().toISOString() : null }
            : ep,
        ),
      );

      try {
        const res = await fetch(`/api/episodes/${episodeId}/watched`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watched: newWatched }),
        });
        if (!res.ok) throw new Error("Failed");
      } catch {
        setEpisodes((prev) =>
          prev.map((ep) =>
            ep._id && ep._id.toString() === episodeId.toString() ? { ...ep, watched: currentWatched } : ep,
          ),
        );
      }
    },
    [isTracking, tmdbId, serieData, initialProgress],
  );

  const seasons = episodes.reduce((acc, ep) => {
    const s = ep.seasonNumber;
    if (!acc[s]) acc[s] = [];
    acc[s].push(ep);
    return acc;
  }, {});

  return { seasons, toggleEpisode, isTracking };
}
