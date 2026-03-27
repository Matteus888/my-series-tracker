"use client";

import styles from "./ConfirmPopover.module.css";
import Icon from "@mdi/react";
import { mdiCheck, mdiCancel } from "@mdi/js";
import { useEffect, useRef } from "react";

export default function ConfirmPopover({ serieName, isTracked, onConfirm, onClose }) {
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

  return (
    <div className={styles.confirmPopover} ref={popoverRef}>
      <p>{isTracked ? "Remove from" : "Add to"} watched shows?</p>
      <div className={styles.confirmButtons}>
        <span className={styles.validate} onClick={() => onConfirm(true)}>
          <Icon path={mdiCheck} size={0.8} />
        </span>
        <span className={styles.cancel} onClick={() => onConfirm(false)}>
          <Icon path={mdiCancel} size={0.8} />
        </span>
      </div>
    </div>
  );
}
