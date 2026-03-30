"use client";

import styles from "./ConfirmPopover.module.css";
import Icon from "@mdi/react";
import { mdiCheck, mdiCancel } from "@mdi/js";

export default function ConfirmPopover({ isTracked, onConfirm, popoverRef }) {
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
