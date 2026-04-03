"use client";

import { useSeries } from "./useSeries";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import { useAuthGuard } from "./useAuthGuard";
import { useToast } from "@/context/ToastContext";
import { useList } from "@/context/ListContext";
import { usePopover } from "./usePopover";
import { computeAverageScore } from "@/lib/utils/ratings.utils";

export function useSerieCard(serie, onCheckExternal) {
  const { isTracked, isFavorite, toggle, toggleFavorite } = useSeries(serie.id, serie);

  const { trackedSeries } = useTrackedSeries();
  const { requireAuth } = useAuthGuard();
  const { showToast } = useToast();
  const { lists } = useList();

  const confirmPopover = usePopover();
  const watchlistPopover = usePopover();
  const ratingsPopover = usePopover();

  const tracked = trackedSeries.find((s) => s.tmdbId === serie.id);
  const ratings = tracked?.seriesId?.ratings ?? null;
  const score = isTracked && ratings ? computeAverageScore(ratings) : Math.round((serie.vote_average ?? 0) * 10);
  const inAnyList = lists.some((l) => l.series.some((s) => s.tmdbId === serie.id));

  const handleCheck = () => {
    requireAuth(() => {
      if (onCheckExternal) {
        onCheckExternal(serie);
        return;
      }
      confirmPopover.open();
    });
  };

  const handleConfirm = (confirm) => {
    if (isTracked) {
      if (confirm) toggle();
    } else {
      if (confirm) toggle({ markAllWatched: true, status: "completed" });
    }
    confirmPopover.close();
  };

  const handleFavorite = () => {
    requireAuth(() => {
      if (!isTracked) {
        showToast("Mark this show as watched first to add it to favorites.", "error");
        return;
      }
      toggleFavorite();
    });
  };

  const handleWatchlist = () => {
    requireAuth(() => watchlistPopover.toggle());
  };

  const handleRatings = () => {
    requireAuth(() => {
      if (!isTracked) {
        showToast("Follow show first to rate it.", "error");
        return;
      }
      ratingsPopover.toggle();
    });
  };

  return {
    // state
    isTracked,
    isFavorite,
    tracked,
    score,
    inAnyList,

    // popovers
    confirmPopover,
    watchlistPopover,
    ratingsPopover,

    // handlers
    handleCheck,
    handleConfirm,
    handleFavorite,
    handleWatchlist,
    handleRatings,
  };
}
