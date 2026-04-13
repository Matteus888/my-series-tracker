"use client";

import styles from "./SortSidebar.module.css";
import { useEffect, useState } from "react";
import { getTvGenres } from "@/lib/api/tmdb.api";
import Icon from "@mdi/react";
import { mdiChevronDown, mdiChevronUp } from "@mdi/js";

const SORT_OPTIONS = [
  { label: "Popular", value: "popular" },
  { label: "Top rated", value: "top_rated" },
  { label: "Trending", value: "trending" },
  { label: "New releases", value: "new_releases" },
  { label: "Upcoming", value: "upcoming" },
  { label: "A → Z", value: "name_asc" },
  { label: "Z → A", value: "name_desc" },
];

export default function SortSidebar({ sortBy, selectedGenre, onSortChange, onGenreChange }) {
  const [genres, setGenres] = useState([]);
  const [genresOpen, setGenresOpen] = useState(false);

  useEffect(() => {
    getTvGenres().then(setGenres);
  }, []);

  return (
    <div className={styles.sidebar}>
      <p className={styles.title}>Catalogue</p>
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

      <button className={styles.genreToggle} onClick={() => setGenresOpen((prev) => !prev)}>
        <span>By genre</span>
        <Icon path={genresOpen ? mdiChevronUp : mdiChevronDown} size={0.8} />
      </button>
      {genresOpen && (
        <ul className={styles.list}>
          {genres.map((genre) => (
            <li
              key={genre.id}
              className={`${styles.item} ${selectedGenre === genre.id ? styles.active : ""}`}
              onClick={() => onGenreChange(genre.id)}
            >
              {genre.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
