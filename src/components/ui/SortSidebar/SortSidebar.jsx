"use client";

import styles from "./SortSidebar.module.css";

const SORT_OPTIONS = [
  { label: "Popularity", value: "popularity.desc" },
  { label: "Top rated", value: "vote_average.desc" },
  { label: "Newest first", value: "first_air_date.desc" },
  { label: "Oldest first", value: "first_air_date.asc" },
  { label: "Name A-Z", value: "name.asc" },
  { label: "Name Z-A", value: "name.desc" },
];

export default function SortSidebar({ sortBy, onSortChange }) {
  return (
    <div className={styles.sidebar}>
      <p className={styles.title}>Sort by</p>
      <ul className={styles.list}>
        {SORT_OPTIONS.map((option) => (
          <li
            key={option.value}
            className={`${styles.item} ${sortBy === option.value ? styles.active : ""}`}
            onClick={() => onSortChange(option.value)}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
