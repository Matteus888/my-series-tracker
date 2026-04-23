"use client";

import { useState, useEffect, useCallback } from "react";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";

export function useCalendar() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { trackedSeries } = useTrackedSeries();

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/calendar");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setItems(data.calendar ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, trackedSeries]);

  return { items, loading, error };
}
