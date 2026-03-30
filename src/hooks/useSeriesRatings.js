import { useState, useEffect } from "react";
import { computeAverageScore } from "@/lib/utils/ratings.utils";

export const useSeriesRatings = (tmdbId) => {
  const [ratings, setRatings] = useState(null);
  const [score, setScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!tmdbId) return;

    const fetchRatings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/series/${tmdbId}/ratings`);
        const data = await response.json();
        setRatings(data.ratings);
        setScore(computeAverageScore(data.ratings));
      } catch (err) {
        console.error("Error fetching ratings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, [tmdbId]);

  return { ratings, score, isLoading };
};
