"use client";

import { useState, useMemo } from "react";
import styles from "./EpisodeVideoSection.module.css";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import VideoCard from "@/components/series/VideoCard/VideoCard";
import VideoLightbox from "@/components/series/VideoLightbox/VideoLightbox";
import { useCarouselArrows } from "@/hooks/useCarouselArrows";
import CarouselArrows from "@/components/ui/CarouselArrows/CarouselArrows";

export default function EpisodeVideoSection({ videos = [] }) {
  const [selectedType, setSelectedType] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } = useCarouselArrows();

  const availableTypes = useMemo(() => {
    const set = new Set(videos.map((v) => v.type));
    return Array.from(set).sort((a, b) => {
      if (a === "Trailer") return -1;
      if (b === "Trailer") return 1;
      return a.localeCompare(b);
    });
  }, [videos]);

  const activeType =
    selectedType && availableTypes.includes(selectedType)
      ? selectedType
      : ((availableTypes.includes("Trailer") ? "Trailer" : availableTypes[0]) ?? null);

  const filtered = useMemo(() => videos.filter((v) => v.type === activeType), [videos, activeType]);

  if (videos.length === 0) return null;

  return (
    <>
      <SectionHeader
        title="Videos"
        storageKey="episode-videos-open"
        defaultOpen
        actions={
          <div className={styles.headerActions}>
            <Dropdown options={availableTypes} value={activeType} onChange={setSelectedType} />
            <span className={styles.counter}>{filtered.length}</span>
          </div>
        }
      >
        <div className={styles.carouselWrapper}>
          <CarouselArrows canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scrollBy} />
          <div className={styles.track} ref={scrollerRef}>
            {filtered.map((v) => (
              <VideoCard key={v.key} video={v} onClick={() => setActiveVideo(v)} />
            ))}
          </div>
        </div>
      </SectionHeader>

      {activeVideo && <VideoLightbox video={activeVideo} onClose={() => setActiveVideo(null)} />}
    </>
  );
}
