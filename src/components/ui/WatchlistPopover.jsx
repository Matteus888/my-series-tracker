"use client";

import styles from "./WatchlistPopover.module.css";
import Icon from "@mdi/react";
import { mdiCheck, mdiPlus } from "@mdi/js";
import { useEffect, useState, useRef } from "react";
import { useList } from "@/context/ListContext";

export default function WatchlistPopover({ serie, onClose }) {
  const { lists, watchlist, isInWatchlist, addSeriesToList, removeSeriesFromList, createList } = useList();
  const [newListName, setNewListName] = useState("");
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleToggleList = (list) => {
    const seriesInList = list.series.find((s) => s.tmdbId === serie.id);
    if (seriesInList) {
      removeSeriesFromList(list._id, seriesInList._id);
    } else {
      addSeriesToList(list._id, serie.id, serie);
    }
    onClose();
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const newList = await createList(newListName.trim());
    if (newList) {
      await addSeriesToList(newList._id, serie.id, serie);
      setNewListName("");
      onClose();
    }
  };

  const isSerieInList = (list) => {
    return list.series.some((s) => s.tmdbId === serie.id);
  };

  const sortedLists = [...(watchlist ? [watchlist] : []), ...lists.filter((l) => !l.isDefault)];

  return (
    <div className={styles.popover} ref={popoverRef}>
      <p className={styles.title}>Add to list</p>
      <ul className={styles.lists}>
        {sortedLists.map((list) => {
          const inList = isSerieInList(list);
          return (
            <li
              key={list._id}
              className={`${styles.listItem} ${inList ? "active" : ""}`}
              onClick={() => handleToggleList(list)}
            >
              <span className={styles.listName}>
                {list.name}
                {list.isDefault && <span className={styles.defaultBadge}>default</span>}
              </span>
              {inList && <Icon path={mdiCheck} size={0.7} style={{ opacity: inList ? 1 : 0 }} />}
            </li>
          );
        })}
      </ul>
      <form onSubmit={handleCreateList} className={styles.createForm}>
        <input
          type="text"
          placeholder="New list..."
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.createButton} disabled={!newListName.trim()}>
          <Icon path={mdiPlus} size={0.8} />
        </button>
      </form>
    </div>
  );
}
