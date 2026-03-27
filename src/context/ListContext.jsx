"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "./ToastContext";

const ListContext = createContext(null);

export const ListProvider = ({ children }) => {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLists = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/lists");
      const data = await response.json();
      setLists(data.lists ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const createList = useCallback(
    async (name, description, isPublic = false) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/lists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, isPublic }),
        });
        const data = await response.json();
        await fetchLists();
        showToast(`List "${name}" created ✓`);
        return data.list;
      } catch (err) {
        setError(err.message);
        showToast(err.message, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchLists, showToast],
  );

  const updateList = useCallback(
    async (listId, updates) => {
      setIsLoading(true);
      try {
        await fetch(`/api/lists/${listId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        await fetchLists();
        showToast("List updated ✓");
      } catch (err) {
        setError(err.message);
        showToast(err.message, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchLists, showToast],
  );

  const deleteList = useCallback(
    async (listId) => {
      setIsLoading(true);
      try {
        await fetch(`/api/lists/${listId}`, { method: "DELETE" });
        await fetchLists();
        showToast("List deleted");
      } catch (err) {
        setError(err.message);
        showToast(err.message, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchLists, showToast],
  );

  const addSeriesToList = useCallback(
    async (listId, tmdbId, serieData) => {
      setIsLoading(true);
      try {
        await fetch(`/api/lists/${listId}/series`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbId, serieData }),
        });
        await fetchLists();
        const list = lists.find((l) => l._id === listId);
        showToast(`${serieData.name} added to "${list?.name}" ✓`);
      } catch (err) {
        setError(err.message);
        showToast(err.message, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchLists, showToast, lists],
  );

  const removeSeriesFromList = useCallback(
    async (listId, seriesId) => {
      setIsLoading(true);
      try {
        await fetch(`/api/lists/${listId}/series`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seriesId }),
        });
        const list = lists.find((l) => l._id === listId);
        await fetchLists();
        showToast(`Series removed from "${list?.name}"`);
      } catch (err) {
        console.error(err.message);
        setError(err.message);
        showToast(err.message, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchLists, showToast, lists],
  );

  const isInList = useCallback(
    (listId, seriesMongoId) => {
      const list = lists.find((l) => l._id === listId);
      return list?.series.some((s) => s._id === seriesMongoId) ?? false;
    },
    [lists],
  );

  const watchlist = lists.find((l) => l.isDefault) ?? null;

  const isInWatchlist = useCallback(
    (tmdbId) => {
      if (!watchlist) return false;
      return watchlist.series.some((s) => s.tmdbId === tmdbId);
    },
    [watchlist],
  );

  return (
    <ListContext.Provider
      value={{
        lists,
        watchlist,
        isLoading,
        error,
        createList,
        updateList,
        deleteList,
        addSeriesToList,
        removeSeriesFromList,
        isInList,
        isInWatchlist,
        refresh: fetchLists,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};

export const useList = () => {
  const ctx = useContext(ListContext);
  if (!ctx) throw new Error("useList must be used within ListProvider");
  return ctx;
};
