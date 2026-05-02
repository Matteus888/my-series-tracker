"use client";

import styles from "./ListActions.module.css";
import Icon from "@mdi/react";
import { mdiDotsHorizontal, mdiTrashCanOutline, mdiCancel } from "@mdi/js";
import { usePopover } from "@/hooks/usePopover";
import { useList } from "@/context/ListContext";

export default function ListActions({ list }) {
  const { isOpen: menuOpen, close: closeMenu, toggle: toggleMenu, popoverRef: menuRef } = usePopover();

  const { isOpen: confirmOpen, open: openConfirm, close: closeConfirm, popoverRef: confirmRef } = usePopover();

  const { deleteList } = useList();

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    closeMenu();
    openConfirm();
  };

  const handleConfirm = async (e) => {
    e.stopPropagation();
    await deleteList(list._id);
    closeConfirm();
  };

  const handleCancel = (e) => {
    e.stopPropagation();
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
          <button type="button" className={styles.menuItem} onClick={handleDeleteClick}>
            <Icon path={mdiTrashCanOutline} size={0.7} />
            <span>Delete list</span>
          </button>
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
            <button type="button" className={styles.cancelBtn} onClick={handleCancel} title="Cancel">
              <Icon path={mdiCancel} size={0.7} />
            </button>
            <button type="button" className={styles.deleteBtn} onClick={handleConfirm} title="Delete">
              <Icon path={mdiTrashCanOutline} size={0.7} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
