"use client";

import { useTrackedSeries } from "@/context/TrackedSeriesContext";

export const useSeries = (seriesId, serieData) => {
  const { isTracked, isFavorite, addSeries, removeSeries, updateSeries } = useTrackedSeries();

  const tracked = isTracked(seriesId);
  const favorited = isFavorite(seriesId);

  const toggle = (options = {}) => {
    if (tracked) removeSeries(seriesId);
    else addSeries(seriesId, serieData, options);
  };

  const toggleFavorite = () => {
    if (!tracked) return;
    updateSeries(seriesId, { isFavorite: !favorited });
  };

  return { isTracked: tracked, isFavorite: favorited, toggle, toggleFavorite, addSeries, removeSeries };
};
