"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";

export function useEpisodeRating(episodeId, initialRating, onRated) {
  const [rating, setRating] = useState(initialRating ?? null);
  const { showToast } = useToast();

  const updateRating = async (newRating) => {
    const previous = rating;
    setRating(newRating);

    try {
      const response = await fetch(`/api/episodes/${episodeId}/rating`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: newRating }),
      });
      if (!response.ok) throw new Error("Failed to rate episode");
      if (onRated) onRated(newRating);
    } catch (err) {
      setRating(previous);
      showToast("Could not save your rating", "error");
    }
  };

  return { rating, updateRating };
}
