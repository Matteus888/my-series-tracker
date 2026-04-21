import { useState, useEffect, useCallback } from "react";

export function useSeriesProgress(trackedSeries) {
  const [progressMap, setProgressMap] = useState({});

  const fetchProgress = useCallback(async () => {
    if (!trackedSeries?.length) return;
    try {
      const res = await fetch("/api/series/progress");
      if (!res.ok) return;
      const { progress } = await res.json();
      const map = {};
      for (const item of progress) map[String(item.tmdbId)] = item;
      setProgressMap(map);
    } catch (err) {
      console.error("useSeriesProgress error:", err);
    }
  }, [trackedSeries?.length]);

  useEffect(() => {
    const load = async () => {
      await fetchProgress();
    };
    load();
  }, [fetchProgress]);

  return { progressMap, refetchProgress: fetchProgress };
}
