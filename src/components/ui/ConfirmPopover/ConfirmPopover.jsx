"use client";

import styles from "./ConfirmPopover.module.css";
import Icon from "@mdi/react";
import { mdiCheck, mdiCheckAll, mdiCancel, mdiEyeOffOutline, mdiDelete, mdiPlay } from "@mdi/js";

export default function ConfirmPopover({ serieName, isTracked, isDropped, onConfirm, popoverRef }) {
  // Cas 1 : pas trackée → proposer d'ajouter
  if (!isTracked) {
    return (
      <div className={styles.confirmPopover} ref={popoverRef}>
        <p>{`Add "${serieName}" to watched series?`}</p>
        <div className={styles.confirmButtons}>
          <span className={styles.validate} onClick={() => onConfirm("first")} title="Mark first episode only">
            <Icon path={mdiCheck} size={0.8} />
          </span>
          <span className={styles.validate} onClick={() => onConfirm("all")} title="Mark all episodes">
            <Icon path={mdiCheckAll} size={0.8} />
          </span>
          <span className={styles.cancel} onClick={() => onConfirm(false)}>
            <Icon path={mdiCancel} size={0.8} />
          </span>
        </div>
      </div>
    );
  }

  // Cas 2 : trackée mais arrêtée → proposer reprise ou suppression
  if (isDropped) {
    return (
      <div className={styles.confirmPopover} ref={popoverRef}>
        <p>{`Resume watching "${serieName}"?`}</p>
        <div className={styles.confirmButtons}>
          <span className={styles.validate} onClick={() => onConfirm("resume")} title="Resume watching">
            <Icon path={mdiCheck} size={0.8} />
          </span>
          <span className={styles.danger} onClick={() => onConfirm("remove")} title="Remove completely">
            <Icon path={mdiDelete} size={0.8} />
          </span>
          <span className={styles.cancel} onClick={() => onConfirm(false)}>
            <Icon path={mdiCancel} size={0.8} />
          </span>
        </div>
      </div>
    );
  }

  // Cas 3 : trackée et active → proposer stop ou remove
  return (
    <div className={styles.confirmPopover} ref={popoverRef}>
      <p>{`Stop watching "${serieName}"?`}</p>
      <div className={styles.confirmButtons}>
        <span
          className={styles.validate}
          onClick={() => onConfirm("stop")}
          title="Stop following (keep watched episodes)"
        >
          <Icon path={mdiEyeOffOutline} size={0.8} />
        </span>
        <span
          className={styles.danger}
          onClick={() => onConfirm("remove")}
          title="Remove completely (erase all progress)"
        >
          <Icon path={mdiDelete} size={0.8} />
        </span>
        <span className={styles.cancel} onClick={() => onConfirm(false)}>
          <Icon path={mdiCancel} size={0.8} />
        </span>
      </div>
    </div>
  );
}
