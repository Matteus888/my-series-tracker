"use client";

import styles from "./SortSidebar.module.css";
import GenreFilter from "../GenreFilter/GenreFilter";

const SORT_OPTIONS = [
  { label: "Popular", value: "popular" },
  { label: "Top rated", value: "top_rated" },
  { label: "Trending", value: "trending" },
  { label: "New releases", value: "new_releases" },
  { label: "Upcoming", value: "upcoming" },
];

export default function SortSidebar({ sortBy, selectedGenre, onSortChange, onGenreChange }) {
  return (
    <div className={styles.sidebar}>
      <ul className={styles.list}>
        {SORT_OPTIONS.map((option) => (
          <li
            key={option.value}
            className={`${styles.item} ${sortBy === option.value && !selectedGenre ? styles.active : ""}`}
            onClick={() => {
              onSortChange(option.value);
              onGenreChange(null);
            }}
          >
            {option.label}
          </li>
        ))}
      </ul>

      <GenreFilter selectedGenre={selectedGenre} onGenreChange={onGenreChange} showAll={false} />
    </div>
  );
}
