"use client";

import styles from "./ConfirmPopover.module.css";
import { useState } from "react";
import Icon from "@mdi/react";
import {
  mdiCheck,
  mdiCheckAll,
  mdiCancel,
  mdiEyeOffOutline,
  mdiDelete,
  mdiClockOutline,
  mdiCalendar,
  mdiCalendarBlank,
  mdiArrowLeft,
} from "@mdi/js";

export default function ConfirmPopover({ serieName, firstAirDate, isTracked, isDropped, onConfirm, popoverRef }) {
  const [dateMode, setDateMode] = useState(false);

  const todayISO = new Date().toISOString().slice(0, 10);
  const currentYear = new Date().getFullYear();

  // firstAirDate peut être une string ("2019-05-01"), un Date, ou absent.
  const parsedFirstAir = firstAirDate ? new Date(firstAirDate) : null;
  const firstYear = parsedFirstAir && !isNaN(parsedFirstAir.getTime()) ? parsedFirstAir.getFullYear() : 1950;
  const minDateISO = firstYear > 1950 ? `${firstYear}-01-01` : undefined;
  const [dateValue, setDateValue] = useState(todayISO);
  const [yearValue, setYearValue] = useState(currentYear);

  // Liste d'années de l'année courante jusqu'à la première diffusion
  const years = [];
  for (let y = currentYear; y >= firstYear; y--) years.push(y);

  const confirmDate = () => onConfirm("all", new Date(dateValue).toISOString());
  const confirmYear = () => onConfirm("all", new Date(yearValue, 0, 1).toISOString());

  // Cas 1 : pas trackée → proposer d'ajouter
  if (!isTracked) {
    // Sous-écran : choix de la date de visionnage pour "all"
    if (dateMode) {
      return (
        <div className={styles.confirmPopover} ref={popoverRef}>
          <p>When did you watch it?</p>

          <div className={styles.dateOptions}>
            <button type="button" className={styles.dateRow} onClick={() => onConfirm("all", null)}>
              {/* <Icon path={mdiClockOutline} size={0.8} /> */}
              <span className={styles.justNow}>Just now</span>
            </button>

            <div className={styles.dateRow}>
              {/* <Icon path={mdiCalendar} size={0.8} /> */}
              <input
                type="date"
                className={styles.dateInput}
                value={dateValue}
                min={minDateISO}
                max={todayISO}
                onChange={(e) => setDateValue(e.target.value)}
              />
              <span className={styles.validate} onClick={confirmDate} title="Confirm date">
                <Icon path={mdiCheck} size={0.7} />
              </span>
            </div>

            <div className={styles.dateRow}>
              {/* <Icon path={mdiCalendarBlank} size={0.8} /> */}
              <select
                className={styles.yearSelect}
                value={yearValue}
                onChange={(e) => setYearValue(Number(e.target.value))}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <span className={styles.validate} onClick={confirmYear} title="Confirm year">
                <Icon path={mdiCheck} size={0.7} />
              </span>
            </div>
          </div>

          <div className={styles.confirmButtons}>
            <span className={styles.cancel} onClick={() => setDateMode(false)} title="Back">
              <Icon path={mdiArrowLeft} size={0.8} />
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.confirmPopover} ref={popoverRef}>
        <p>{`Add "${serieName}" to watched series?`}</p>
        <div className={styles.confirmButtons}>
          <span className={styles.validate} onClick={() => onConfirm("first")} title="Mark first episode only">
            <Icon path={mdiCheck} size={0.8} />
          </span>
          <span className={styles.validate} onClick={() => setDateMode(true)} title="Mark all episodes">
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
