"use client";

import { useTrackedSeries } from "@/context/TrackedSeriesContext";

export const useSeries = (seriesId, serieData) => {
  const { isTracked, addSeries, removeSeries } = useTrackedSeries();

  const tracked = isTracked(seriesId);

  const toggle = () => {
    if (tracked) removeSeries(seriesId);
    else addSeries(seriesId, serieData);
  };
  return { isTracked: tracked, toggle, addSeries, removeSeries };
};
