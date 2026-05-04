"use client";

import styles from "./SeasonSelector.module.css";
import Icon from "@mdi/react";
import { mdiMenuDown } from "@mdi/js";
import { usePopover } from "@/hooks/usePopover";

export default function SeasonSelector({ seasons, activeSeason, onSelect }) {
  const { isOpen, toggle, close, popoverRef } = usePopover();

  const handleSelect = (seasonNumber) => {
    onSelect(seasonNumber);
    close();
  };

  return (
    <div className={styles.wrapper} ref={popoverRef}>
      <button
        className={`${styles.trigger} ${isOpen ? styles.active : ""}`}
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.value}>{activeSeason}</span>
        <Icon path={mdiMenuDown} size={0.8} className={styles.chevron} />
      </button>

      {isOpen && (
        <ul className={styles.menu} role="listbox">
          {seasons.map((s) => (
            <li key={s}>
              <button
                className={`${styles.option} ${s === activeSeason ? styles.selected : ""}`}
                onClick={() => handleSelect(s)}
                role="option"
                aria-selected={s === activeSeason}
              >
                <span className={styles.optionValue}>{s}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
