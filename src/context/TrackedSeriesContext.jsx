"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const TrackedSeriesContext = createContext(null);

export const TrackedSeriesProvider = ({ children }) => {
  const { data: session } = useSession();
  const [trackedSeries, setTrackedSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrackedSeries = useCallback(async () => {
    if (!session) return setIsLoading(true);

    try {
      const response = await fetch("/api/series/tracked");
      const data = await response.json();
      setTrackedSeries(data.trackedSeries ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchTrackedSeries();
  }, [fetchTrackedSeries]);

  const addSeries = useCallback(
    async (seriesId, options = {}) => {
      setTrackedSeries((prev) => [...prev, { seriesId, ...options }]);
      try {
        const response = await fetch("/api/series/tracked", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seriesId, ...options }),
        });
        const data = await response.json();
        setTrackedSeries(data.trackedSeries ?? []);
      } catch (err) {
        setError(err.message);
        fetchTrackedSeries();
      }
    },
    [fetchTrackedSeries],
  );

  const removeSeries = useCallback(
    async (seriesId) => {
      const prev = trackedSeries;
      setTrackedSeries((curr) => curr.filter((s) => s.seriesId !== seriesId));
      try {
        const response = await fetch("/api/series/tracked", {
          methode: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serieId: seriesId }),
        });
        const data = await response.json();
        setTrackedSeries(data.trackedSeries);
      } catch (err) {
        setError(err.message);
        setTrackedSeries(prev);
      }
    },
    [trackedSeries, fetchTrackedSeries],
  );

  const isTracked = useCallback(
    (seriesId) => trackedSeries.some((s) => s.seriesId?.toString() === seriesId?.toString()),
    [trackedSeries],
  );

  return (
    <TrackedSeriesContext.Provider
      value={{ trackedSeries, isLoading, error, addSeries, removeSeries, isTracked, refresh: fetchTrackedSeries }}
    >
      {children}
    </TrackedSeriesContext.Provider>
  );
};

export const useTrackedSeries = () => {
  const context = useContext(TrackedSeriesContext);
  if (!context) throw new Error("useTrackedSeries must be used within TrackedSeriesProvider");
  return context;
};
