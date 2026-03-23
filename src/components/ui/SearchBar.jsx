"use client";

import styles from "./SearchBar.module.css";
import { useEffect, useRef, useState } from "react";
import { useSearch } from "@/context/SearchContext";
import { searchSeries } from "@/lib/api/tmdb.api";
import { useRouter } from "next/navigation";
import DynamicSearchResult from "../series/DynamicSearchResult";
import DynamicSearchResultSkeleton from "./DynamicSearchResultSkeleton";

export default function SearchBar() {
  const { query, setQuery, results, setResults, loading, setLoading, isOpen, setIsOpen } = useSearch();
  const searchInputRef = useRef(null);
  const router = useRouter();
  const [totalResults, setTotalResults] = useState(0);

  // Recherche live avec debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setTotalResults(0);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchSeries(query, 1);
        setResults(data.results.slice(0, 10));
        setTotalResults(data.totalResults);
        setIsOpen(true);
      } catch (err) {
        console.error(err);
        setResults([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, setResults, setLoading, setIsOpen]);

  // Fermeture de la liste si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsOpen]);

  // Redirection page search quand "Enter"
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleSelectSerie = () => {
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className={styles.container} ref={searchInputRef}>
      <input
        type="text"
        className={`${styles.searchInput} ${isOpen ? styles.searchInputOpen : ""}`}
        placeholder="Search for a serie..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setIsOpen(!!results.length)}
        onKeyDown={handleKeyDown}
      />
      {/* Icône à gauche */}
      <span className={styles.icon} onClick={() => query && setQuery("")}>
        {query ? "✕" : "🔍"}
      </span>
      {/* Séparateur vertical */}
      <div className={styles.separator} />

      {/* Liste des résultats */}
      {isOpen && (
        <div className={styles.resultsContainer}>
          <div className={styles.resultsList}>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => <DynamicSearchResultSkeleton key={index} />)
            ) : results.length > 0 ? (
              <>
                {results.map((serie) => (
                  <DynamicSearchResult key={serie.id} serie={serie} onSelect={handleSelectSerie} />
                ))}
                <div className={styles.resultsFooter}>
                  {totalResults} result{totalResults > 1 ? "s" : ""} found
                </div>
              </>
            ) : (
              <div className={styles.noResults}>No result found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
