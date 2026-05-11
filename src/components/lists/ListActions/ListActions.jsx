"use client";

import styles from "./ListActions.module.css";
import Icon from "@mdi/react";
import { useState } from "react";
import {
  mdiDotsHorizontal,
  mdiTrashCanOutline,
  mdiCancel,
  mdiPencilOutline,
  mdiEarth,
  mdiLock,
  mdiCheck,
} from "@mdi/js";
import { usePopover } from "@/hooks/usePopover";
import { useList } from "@/context/ListContext";

export default function ListActions({ list }) {
  const { isOpen: menuOpen, close: closeMenu, toggle: toggleMenu, popoverRef: menuRef } = usePopover();
  const { isOpen: confirmOpen, open: openConfirm, close: closeConfirm, popoverRef: confirmRef } = usePopover();
  const { isOpen: editOpen, open: openEdit, close: closeEdit, popoverRef: editRef } = usePopover();

  const { deleteList, updateList } = useList();

  const [name, setName] = useState(list.name);
  const [description, setDescription] = useState(list.description ?? "");

  const handleEditClick = (e) => {
    e.stopPropagation();
    setName(list.name);
    setDescription(list.description ?? "");
    closeMenu();
    openEdit();
  };

  const handleSaveEdit = async (e) => {
    e.stopPropagation();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const updates = {};
    if (trimmedName !== list.name) updates.name = trimmedName;
    if (description.trim() !== (list.description ?? "")) updates.description = description.trim();
    if (Object.keys(updates).length > 0) {
      await updateList(list._id, updates);
    }
    closeEdit();
  };

  const handleToggleVisibility = async (e) => {
    e.stopPropagation();
    closeMenu();
    await updateList(list._id, { isPublic: !list.isPublic });
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    closeMenu();
    openConfirm();
  };

  const handleConfirmDelete = async (e) => {
    e.stopPropagation();
    await deleteList(list._id);
    closeConfirm();
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        onClick={(e) => {
          e.stopPropagation();
          toggleMenu();
        }}
        aria-label="List actions"
      >
        <Icon path={mdiDotsHorizontal} size={1} />
      </button>

      {menuOpen && (
        <div className={styles.menu} ref={menuRef}>
          <button type="button" className={styles.menuItem} onClick={handleEditClick}>
            <Icon path={mdiPencilOutline} size={0.7} />
            <span>Edit details</span>
          </button>
          <button type="button" className={styles.menuItem} onClick={handleToggleVisibility}>
            <Icon path={list.isPublic ? mdiLock : mdiEarth} size={0.7} />
            <span>{list.isPublic ? "Make private" : "Make public"}</span>
          </button>
          <button type="button" className={`${styles.menuItem} ${styles.danger}`} onClick={handleDeleteClick}>
            <Icon path={mdiTrashCanOutline} size={0.7} />
            <span>Delete list</span>
          </button>
        </div>
      )}

      {editOpen && (
        <div className={styles.edit} ref={editRef} onClick={(e) => e.stopPropagation()}>
          <label className={styles.editLabel}>
            <span>Name</span>
            <input
              type="text"
              className={styles.editInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              autoFocus
            />
          </label>
          <label className={styles.editLabel}>
            <span>Description</span>
            <textarea
              className={styles.editTextarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
            />
          </label>
          <div className={styles.confirmActions}>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSaveEdit}
              title="Save"
              disabled={!name.trim()}
            >
              <Icon path={mdiCheck} size={0.7} />
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={(e) => {
                e.stopPropagation();
                closeEdit();
              }}
              title="Cancel"
            >
              <Icon path={mdiCancel} size={0.7} />
            </button>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className={styles.confirm} ref={confirmRef}>
          <p className={styles.confirmText}>
            Delete <strong>{list.name}</strong>?
          </p>
          <p className={styles.confirmHint}>
            This list will be permanently removed. The series themselves stay tracked.
          </p>
          <div className={styles.confirmActions}>
            <button type="button" className={styles.deleteBtn} onClick={handleConfirmDelete} title="Delete">
              <Icon path={mdiTrashCanOutline} size={0.7} />
            </button>
            <button
              type="button"
              className={styles.cancelDeleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                closeConfirm();
              }}
              title="Cancel"
            >
              <Icon path={mdiCancel} size={0.7} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
