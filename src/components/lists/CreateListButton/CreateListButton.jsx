"use client";

import { useState } from "react";
import styles from "./CreateListButton.module.css";
import Icon from "@mdi/react";
import { mdiPlaylistPlus, mdiCancel, mdiCheck, mdiEarth, mdiLock, mdiLoading } from "@mdi/js";
import { usePopover } from "@/hooks/usePopover";
import { useList } from "@/context/ListContext";

export default function CreateListButton({ variant = "primary", popoverAlign = "right", popoverPosition = "bottom" }) {
  const { createList } = useList();
  const { isOpen, open, close, popoverRef } = usePopover();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setIsPublic(false);
  };

  const handleOpen = () => {
    resetForm();
    open();
  };

  const handleCancel = () => {
    close();
    resetForm();
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || submitting) return;
    setSubmitting(true);
    try {
      await createList(trimmedName, description.trim(), isPublic);
      close();
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.trigger} ${styles[variant]}`}
        onClick={handleOpen}
        aria-label="Create new list"
      >
        <Icon path={mdiPlaylistPlus} size={0.9} />
        <span>New list</span>
      </button>

      {isOpen && (
        <div
          className={`${styles.popover} ${styles[`align-${popoverAlign}`]} ${styles[`position-${popoverPosition}`]}`}
          ref={popoverRef}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className={styles.popoverTitle}>Create a new list</h3>

          <label className={styles.field}>
            <span>Name</span>
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="e.g. Cozy autumn shows"
              autoFocus
            />
          </label>

          <label className={styles.field}>
            <span>Description</span>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Optional"
            />
          </label>

          <button
            type="button"
            className={styles.visibilityToggle}
            onClick={() => setIsPublic((v) => !v)}
            aria-pressed={isPublic}
          >
            <Icon path={isPublic ? mdiEarth : mdiLock} size={0.7} />
            <span>{isPublic ? "Public" : "Private"}</span>
            <span className={styles.visibilityHint}>
              {isPublic ? "Visible on your profile" : "Only you can see it"}
            </span>
          </button>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={handleCancel} title="Cancel">
              <Icon path={mdiCancel} size={0.7} />
            </button>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!name.trim() || submitting}
              title="Create"
            >
              <Icon path={submitting ? mdiLoading : mdiCheck} size={0.7} className={submitting ? styles.spinner : ""} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
