"use client";

import { useState, useEffect } from "react";
import styles from "./SeasonEpisodesCarousel.module.css";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";
import WatchedEpisodeCard from "@/components/dashboard/WatchedEpisodeCard/WatchedEpisodeCard";
import { useToast } from "@/context/ToastContext";

export default function SeasonEpisodesCarousel({
  episodes: initialEpisodes,
  currentEpisodeId,
  seasonNumber,
  seriesTmdbId,
}) {
  const [episodes, setEpisodes] = useState(initialEpisodes);
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();
  const { showToast } = useToast();

  useEffect(() => setEpisodes(initialEpisodes), [initialEpisodes]);

  if (episodes.length === 0) return null;

  const handleToggle = async (episodeId, currentWatched) => {
    const newWatched = !currentWatched;
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
