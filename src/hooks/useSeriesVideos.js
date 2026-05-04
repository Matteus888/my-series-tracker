"use client";

import { useEffect, useState } from "react";

export function useSeriesVideos(tmdbId) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tmdbId) return;
    let cancelled = false;

    fetch(`/api/series/${tmdbId}/videos`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch videos");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setVideos(data.videos ?? []);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tmdbId]);

  return { videos, loading, error };
}
