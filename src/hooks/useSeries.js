"use client";

import { useTrackedSeries } from "@/context/TrackedSeriesContext";

export const useSeries = (seriesId, serieData) => {
  const { isTracked, addSeries, removeSeries } = useTrackedSeries();

  const tracked = isTracked(seriesId);

  const toggle = (options = {}) => {
    if (tracked) removeSeries(seriesId);
    else addSeries(seriesId, serieData, options);
  };
  return { isTracked: tracked, toggle, addSeries, removeSeries };
};
