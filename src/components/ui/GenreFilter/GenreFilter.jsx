"use client";

import styles from "./GenreFilter.module.css";
import { useEffect, useState } from "react";
import { getTvGenres } from "@/lib/api/tmdb.api";

export default function GenreFilter({ selectedGenre, onGenreChange, showAll = true }) {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    getTvGenres().then(setGenres);
  }, []);

  return (
    <div className={styles.container}>
      <ul className={styles.list}>
        {showAll && (
          <li className={`${styles.item} ${!selectedGenre ? styles.active : ""}`} onClick={() => onGenreChange(null)}>
            All
          </li>
        )}
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
    </div>
  );
}
