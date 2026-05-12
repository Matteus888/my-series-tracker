"use client";

import { useSeries } from "./useSeries";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";
import { useAuthGuard } from "./useAuthGuard";
import { useToast } from "@/context/ToastContext";
import { useList } from "@/context/ListContext";
import { usePopover } from "./usePopover";
import { computeAverageScore } from "@/lib/utils/ratings.utils";

export function useSerieCard(serie, onCheckExternal, externalRatings = null) {
  const { isTracked, isFavorite, toggle, toggleFavorite, markDropped, markWatching } = useSeries(serie.id, serie);
  const { trackedSeries, progressMap } = useTrackedSeries();
  const { requireAuth } = useAuthGuard();
  const { showToast } = useToast();
  const { lists } = useList();

  const confirmPopover = usePopover();
  const watchlistPopover = usePopover();
  const ratingsPopover = usePopover();

  const tracked = trackedSeries.find((s) => s.tmdbId === serie.id);
  const isDropped = tracked?.status === "dropped";
  const progressEntry = progressMap?.[String(serie.id)];
  const ratings = externalRatings ?? progressEntry?.ratings ?? tracked?.seriesId?.ratings ?? null;
  const score = ratings ? computeAverageScore(ratings) : Math.round((serie.vote_average ?? 0) * 10);
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
      if (isDropped) {
        if (confirm === "resume") markWatching();
        else if (confirm === "remove") toggle();
      } else {
        if (confirm === "stop") markDropped();
        else if (confirm === "remove") toggle();
      }
    } else {
      if (confirm === "first") toggle({ markFirstWatched: true, status: "watching" });
      if (confirm === "all") toggle({ markAllWatched: true, status: "completed" });
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
    isDropped,
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
