"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTrackedSeries } from "@/context/TrackedSeriesContext";

export function useContinueWatching() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { trackedSeries, incrementWatched, watchedCount } = useTrackedSeries();

  // Préserve l'ordre visuel courant lors d'un refresh (ex: après un check)
  // Clé = seriesId, valeur = index. Mis à jour seulement quand l'ensemble des séries change.
  const orderRef = useRef(null);

  const applyPreservedOrder = useCallback((freshItems) => {
    const previousOrder = orderRef.current;

    // Premier chargement : on adopte l'ordre serveur.
    if (!previousOrder) {
      orderRef.current = new Map(freshItems.map((it, i) => [it.seriesId, i]));
      return freshItems;
    }

    // Trie les items en gardant l'ordre précédent ; les nouveaux vont en fin.
    const sorted = [...freshItems].sort((a, b) => {
      const ai = previousOrder.has(a.seriesId) ? previousOrder.get(a.seriesId) : Infinity;
      const bi = previousOrder.has(b.seriesId) ? previousOrder.get(b.seriesId) : Infinity;
      if (ai !== bi) return ai - bi;
      // Tie-break stable pour les nouvelles séries : ordre serveur (lastWatchedAt desc).
      return freshItems.indexOf(a) - freshItems.indexOf(b);
    });

    // Met à jour la map d'ordre pour refléter la composition courante (même clés, mêmes index).
    orderRef.current = new Map(sorted.map((it, i) => [it.seriesId, i]));
    return sorted;
  }, []);

  // Si l'ensemble des séries trackées change (ajout/suppression hors check),
  // on laisse le serveur dicter le nouvel ordre.
  useEffect(() => {
    orderRef.current = null;
  }, [trackedSeries]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/continue-watching");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setItems(applyPreservedOrder(data.continueWatching));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [trackedSeries, watchedCount, applyPreservedOrder]);

  const checkEpisode = useCallback(
    async (seriesId, episodeId) => {
      const previous = items;

      setItems((current) =>
        current
          .map((item) => {
            if (item.seriesId !== seriesId) return item;

            const newWatchedCount = item.watchedCount + 1;

            if (newWatchedCount >= item.totalCount) return null;

            return {
              ...item,
              watchedCount: newWatchedCount,
              nextEpisode: null,
            };
          })
          .filter(Boolean),
      );

      try {
        const response = await fetch(`/api/episodes/${episodeId}/watched`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watched: true }),
        });
        if (!response.ok) throw new Error("Failed to mark episode as watched");

        const refreshed = await fetch("/api/dashboard/continue-watching");
        if (!refreshed.ok) throw new Error("Failed to refresh");

        incrementWatched();

        const data = await refreshed.json();
        setItems(applyPreservedOrder(data.continueWatching));
      } catch (err) {
        setItems(previous);
        setError(err.message);
      }
    },
    [items, incrementWatched, applyPreservedOrder],
  );

  return { items, loading, error, checkEpisode };
}
