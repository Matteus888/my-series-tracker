"use client";

import styles from "./Dropdown.module.css";
import Icon from "@mdi/react";
import { mdiMenuDown } from "@mdi/js";
import { usePopover } from "@/hooks/usePopover";

export default function Dropdown({ options, value, onChange }) {
  const { isOpen, toggle, close, popoverRef } = usePopover();

  const handleSelect = (option) => {
    onChange(option);
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
        <span className={styles.value}>{value}</span>
        <Icon path={mdiMenuDown} size={0.8} className={styles.chevron} />
      </button>

      {isOpen && (
        <ul className={styles.menu} role="listbox">
          {options.map((option) => (
            <li key={option}>
              <button
                className={`${styles.option} ${option === value ? styles.selected : ""}`}
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={option === value}
              >
                <span className={styles.optionValue}>{option}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
