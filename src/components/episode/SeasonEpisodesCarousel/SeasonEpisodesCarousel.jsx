"use client";

import { useState, useEffect } from "react";
import styles from "./SeasonEpisodesCarousel.module.css";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";
import WatchedEpisodeCard from "@/components/dashboard/WatchedEpisodeCard/WatchedEpisodeCard";
import { useToast } from "@/context/ToastContext";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";

export default function SeasonEpisodesCarousel({
  episodes: initialEpisodes,
  currentEpisodeId,
  seasonNumber,
  seriesTmdbId,
  seriesData,
}) {
  const [episodes, setEpisodes] = useState(initialEpisodes);
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();
  const { showToast } = useToast();
  const { progressMap, isTracked, refresh, incrementWatched, addSeriesOptimistic } = useTrackedSeries();

  useEffect(() => setEpisodes(initialEpisodes), [initialEpisodes]);

  const tracked = isTracked(seriesTmdbId);
  const progressEntry = progressMap?.[String(seriesTmdbId)];
  const watchedSignature = progressEntry ? `${progressEntry.watchedCount}/${progressEntry.totalCount}` : "untracked";

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    const fetchFresh = async () => {
      try {
        if (!tracked) {
          if (!cancelled) {
            setEpisodes((prev) => prev.map((ep) => ({ ...ep, watched: false, watchedAt: null })));
          }
          return;
        }

        const res = await fetch(`/api/series/${seriesTmdbId}/progress`);
        if (!res.ok) return;
        const { episodes: fresh } = await res.json();
        if (cancelled || !Array.isArray(fresh)) return;

        const seasonEps = fresh.filter((ep) => ep.seasonNumber === seasonNumber);
        if (seasonEps.length > 0) setEpisodes(seasonEps);
      } catch (err) {
        console.error("Failed to refetch season episodes:", err.message);
      }
    };

    fetchFresh();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracked, watchedSignature, seriesTmdbId, seasonNumber]);

  if (episodes.length === 0) return null;

  const handleToggle = async (episodeId, currentWatched) => {
    const newWatched = !currentWatched;
    const serieIsTracked = isTracked(seriesTmdbId);

    // Cas spécial : série pas trackée et on veut cocher → on track d'abord
    if (!serieIsTracked && newWatched) {
      // Optimistic UI
      setEpisodes((prev) =>
        prev.map((ep) => (ep._id === episodeId ? { ...ep, watched: true, watchedAt: new Date().toISOString() } : ep)),
      );

      try {
        // 1. Track la série
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
        showToast(`${seriesData?.name ?? "Series"} added to watched shows ✓`);

        // 2. Cocher l'épisode
        const watchRes = await fetch(`/api/episodes/${episodeId}/watched`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watched: true }),
        });
        if (!watchRes.ok) throw new Error("Failed to mark episode");

        incrementWatched();
        await refresh();
      } catch (err) {
        // Rollback
        setEpisodes((prev) =>
          prev.map((ep) => (ep._id === episodeId ? { ...ep, watched: false, watchedAt: null } : ep)),
        );
        showToast("Could not mark episode as watched", "error");
      }
      return;
    }

    // Cas normal : série trackée OU on décoche
    setEpisodes((prev) =>
      prev.map((ep) =>
        ep._id === episodeId
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

      if (newWatched) incrementWatched();
      await refresh();
    } catch {
      setEpisodes((prev) => prev.map((ep) => (ep._id === episodeId ? { ...ep, watched: currentWatched } : ep)));
      showToast(newWatched ? "Could not mark episode" : "Could not unmark episode", "error");
    }
  };

  const handleRate = (episodeId, newRating) => {
    setEpisodes((prev) => prev.map((ep) => (ep._id === episodeId ? { ...ep, rating: newRating } : ep)));
  };

  return (
    <SectionHeader
      title={`Season ${seasonNumber}`}
      subtitle={`${episodes.length} episode${episodes.length > 1 ? "s" : ""}`}
      storageKey={`episode-season-${seriesTmdbId}-${seasonNumber}-open`}
      defaultOpen
    >
      <div className={styles.carouselContainer}>
        <CarouselArrows canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scrollBy} />
        <div className={styles.track} ref={scrollerRef}>
          {episodes.map((ep) => (
            <div key={ep._id} className={`${styles.cardSlot} ${ep._id === currentEpisodeId ? styles.current : ""}`}>
              <WatchedEpisodeCard
                ep={ep}
                onToggle={handleToggle}
                onRate={handleRate}
                showSeason={false}
                showDate={false}
                disableTooltip
              />
            </div>
          ))}
        </div>
      </div>
    </SectionHeader>
  );
}
