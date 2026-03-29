import { useState, useEffect } from "react";
import { computeAverageScore } from "@/lib/utils/ratings.utils";

export const useSeriesRatings = (series) => {
  const [ratingsMap, setRatingsMap] = useState({});

  useEffect(() => {
    if (!series?.length) return;

    const fetchRatings = async () => {
      const tmdbIds = series.map((s) => s.id);
      try {
        const response = await fetch("/api/series/ratings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbIds }),
        });
        const data = await response.json();
        setRatingsMap(data.ratingsMap ?? {});
      } catch (err) {
        console.error("Error fetching ratings:", err);
      }
    };

    fetchRatings();
  }, [series]);

  const getScore = (tmdbId, fallbackVoteAverage = null) => {
    const ratings = ratingsMap[tmdbId];
    if (ratings) return computeAverageScore(ratings);
    if (fallbackVoteAverage) return Math.round(fallbackVoteAverage * 10);
    return null;
  };

  return { ratingsMap, getScore };
};
