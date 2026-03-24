"use client";

import { useTrackedSeries } from "@/context/TrackedSeriesContext";

export const useSeries = (seriesId) => {
  const { isTracked, addSeries, removeSeries } = useTrackedSeries();

  const tracked = isTracked(seriesId);

  const toggle = () => {
    if (tracked) removeSeries(seriesId);
    else addSeries(seriesId);
  };
  return { isTracked: tracked, toggle, addSeries, removeSeries };
};
