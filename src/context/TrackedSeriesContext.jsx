"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "./ToastContext";

const TrackedSeriesContext = createContext(null);

export const TrackedSeriesProvider = ({ children }) => {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [trackedSeries, setTrackedSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrackedSeries = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);

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
    async (seriesId, serieData, options = {}) => {
      try {
        const response = await fetch("/api/series/tracked", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seriesId, serieData, ...options }),
        });
        const data = await response.json();
        await fetchTrackedSeries();
        showToast(`${serieData.name} added to watched shows ✓`);
      } catch (err) {
        setError(err.message);
        showToast(err.message, "error");
      }
    },
    [fetchTrackedSeries, showToast],
  );

  const removeSeries = useCallback(
    async (seriesId) => {
      try {
        const response = await fetch("/api/series/tracked", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serieId: seriesId }),
        });
        await fetchTrackedSeries();
        showToast(`Serie removed from watched shows`);
      } catch (err) {
        setError(err.message);
        showToast(err.message, "error");
      }
    },
    [fetchTrackedSeries, showToast],
  );

  const updateSeries = useCallback(
    async (seriesId, updates) => {
      try {
        const response = await fetch("/api/series/tracked", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seriesId, ...updates }),
        });
        await fetchTrackedSeries();
        showToast(updates.isFavorite ? "Added to favorites ✓" : "Removed from favorites");
      } catch (err) {
        setError(err.message);
        showToast(err.message, "error");
      }
    },
    [fetchTrackedSeries, showToast],
  );

  const isTracked = useCallback(
    (tmdbId) => trackedSeries.some((s) => s.tmdbId?.toString() === tmdbId?.toString()),
    [trackedSeries],
  );

  const isFavorite = useCallback(
    (tmdb) => trackedSeries.some((s) => s.tmdbId?.toString() === tmdb?.toString() && s.isFavorite === true),
    [trackedSeries],
  );

  return (
    <TrackedSeriesContext.Provider
      value={{
        trackedSeries,
        isLoading,
        error,
        addSeries,
        removeSeries,
        updateSeries,
        isTracked,
        isFavorite,
        refresh: fetchTrackedSeries,
      }}
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
