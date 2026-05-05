"use client";

import { useState, useMemo } from "react";
import styles from "./VideoSection.module.css";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import { useSeriesVideos } from "@/hooks/useSeriesVideos";
import VideoCard from "../VideoCard/VideoCard";
import VideoLightbox from "../VideoLightbox/VideoLightbox";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";

export default function VideoSection({ tmdbId }) {
  const { videos, loading, error } = useSeriesVideos(tmdbId);
  const [selectedType, setSelectedType] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const { trackRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();

  // Types disponibles (avec "Trailer" en premier si présent)
  const availableTypes = useMemo(() => {
    const set = new Set(videos.map((v) => v.type));
    const types = Array.from(set);
    types.sort((a, b) => {
      if (a === "Trailer") return -1;
      if (b === "Trailer") return 1;
      return a.localeCompare(b);
    });
    return types;
  }, [videos]);

  // Type actif : sélection user si valide, sinon fallback sur "Trailer" ou le premier
  const activeType =
    selectedType && availableTypes.includes(selectedType)
      ? selectedType
      : ((availableTypes.includes("Trailer") ? "Trailer" : availableTypes[0]) ?? null);

  const filtered = useMemo(() => videos.filter((v) => v.type === activeType), [videos, activeType]);

  if (loading) return null;
  if (error || videos.length === 0) return null;

  return (
    <>
      <SectionHeader
        title="Videos"
        storageKey={`series-videos-open`}
        defaultOpen
        actions={
          <div className={styles.headerActions}>
            <Dropdown options={availableTypes} value={activeType} onChange={setSelectedType} />
            <span className={styles.counter}>{filtered.length}</span>
          </div>
        }
      >
        <div className={styles.carouselWrapper}>
          {canScrollLeft && (
            <button
              className={`${styles.arrow} ${styles.arrowLeft}`}
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
            >
              ‹
            </button>
          )}
          <div className={styles.track} ref={trackRef}>
            {filtered.map((v) => (
              <VideoCard key={`${v.source}-${v.key}`} video={v} onClick={() => setActiveVideo(v)} />
            ))}
          </div>
          {canScrollRight && (
            <button
              className={`${styles.arrow} ${styles.arrowRight}`}
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
            >
              ›
            </button>
          )}
        </div>
      </SectionHeader>

      {activeVideo && <VideoLightbox video={activeVideo} onClose={() => setActiveVideo(null)} />}
    </>
  );
}
