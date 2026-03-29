"use client";

import styles from "./WatchlistPopover.module.css";
import Icon from "@mdi/react";
import { mdiCheck, mdiPlus, mdiClose } from "@mdi/js";
import { useState } from "react";
import { useList } from "@/context/ListContext";

export default function WatchlistPopover({ serie, onClose, popoverRef }) {
  const { lists, watchlist, addSeriesToList, removeSeriesFromList, createList, deleteList } = useList();
  const [newListName, setNewListName] = useState("");

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

  const handleDeleteList = async (e, listId) => {
    e.stopPropagation();
    await deleteList(listId);
  };

  const isSerieInList = (list) => list.series.some((s) => s.tmdbId === serie.id);

  const sortedLists = [...(watchlist ? [watchlist] : []), ...lists.filter((l) => !l.isDefault)];

  return (
    <div className={styles.popover} ref={popoverRef}>
      <p className={styles.title}>Add to list</p>
      <ul className={styles.lists}>
        {sortedLists.map((list) => {
          const inList = isSerieInList(list);
          const isDeletable = !list.isDefault && list.series.length === 0;
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
              <div className={styles.listActions}>
                <Icon path={mdiCheck} size={0.7} style={{ opacity: inList ? 1 : 0 }} />
                {isDeletable && (
                  <span className={styles.deleteList} onClick={(e) => handleDeleteList(e, list._id)}>
                    <Icon path={mdiClose} size={0.6} />
                  </span>
                )}
              </div>
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
