"use client";

import styles from "./ConfirmPopover.module.css";
import Icon from "@mdi/react";
import { mdiCheck, mdiCheckAll, mdiCancel } from "@mdi/js";

export default function ConfirmPopover({ serieName, isTracked, onConfirm, popoverRef }) {
  return (
    <div className={styles.confirmPopover} ref={popoverRef}>
      <p>{isTracked ? `Remove all episodes of "${serieName}" from watched?` : `Add "${serieName}" to watched?`}</p>
      {!isTracked ? (
        <div className={styles.confirmButtons}>
          <span
            className={`${styles.validate} ${styles.validateCheck}`}
            onClick={() => onConfirm("first")}
            title="Mark first episode only"
          >
            <Icon path={mdiCheck} size={0.8} />
          </span>
          <span
            className={`${styles.validate} ${styles.validateCheck}`}
            onClick={() => onConfirm("all")}
            title="Mark all episodes"
          >
            <Icon path={mdiCheckAll} size={0.8} />
          </span>
          <span className={`${styles.cancel} ${styles.cancelCheck}`} onClick={() => onConfirm(false)}>
            <Icon path={mdiCancel} size={0.8} />
          </span>
        </div>
      ) : (
        <div className={styles.confirmButtons}>
          <span className={styles.validate} onClick={() => onConfirm(true)}>
            <Icon path={mdiCheck} size={0.8} />
          </span>
          <span className={styles.cancel} onClick={() => onConfirm(false)}>
            <Icon path={mdiCancel} size={0.8} />
          </span>
        </div>
      )}
    </div>
  );
}
