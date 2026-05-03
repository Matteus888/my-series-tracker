"use client";

import styles from "./SearchBar.module.css";
import Icon from "@mdi/react";
import { mdiMagnify, mdiClose } from "@mdi/js";
import { useEffect, useRef, useState } from "react";
import { useSearch } from "@/context/SearchContext";
import { searchSeries } from "@/lib/api/tmdb.api";
import { useRouter, usePathname } from "next/navigation";
import { sortByRelevance } from "@/lib/utils/searchScore.utils";
import DynamicSearchResult from "../../series/DynamicSearchResult/DynamicSearchResult";
import DynamicSearchResultSkeleton from "../../series/DynamicSearchResultSkeleton/DynamicSearchResultSkeleton";

export default function SearchBar() {
  const { query, setQuery, results, setResults, loading, setLoading, isOpen, setIsOpen } = useSearch();
  const searchInputRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const [totalResults, setTotalResults] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1); // -1 = rien de sélectionné

  const isOnSearchPage = pathname === "/search";

  // Recherche live avec debounce
  useEffect(() => {
    setSelectedIndex(-1);

    if (!query.trim()) {
      setResults([]);
      setTotalResults(0);
      setIsOpen(false);

      // Sur /search, on nettoie l'URL si l'input est vidé
      if (isOnSearchPage) {
        router.replace("/search");
      }
      return;
    }

    const timeoutId = setTimeout(async () => {
      // Sur /search : on push la query dans l'URL, c'est la page qui fetch
      if (isOnSearchPage) {
        router.replace(`/search?query=${encodeURIComponent(query)}`);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const data = await searchSeries(query, 1);
        const sorted = sortByRelevance(data.results, query);
        setResults(sorted.slice(0, 10));
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
  }, [query, setResults, setLoading, setIsOpen, isOnSearchPage, router]);

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

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      if (!isOnSearchPage) setQuery("");
    } else if (!isOnSearchPage) {
      router.push("/search");
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (isOnSearchPage) {
      if (e.key === "Escape") {
        setQuery("");
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        router.push(`/series/${results[selectedIndex].id}`);
        setIsOpen(false);
        setQuery("");
        setSelectedIndex(-1);
      } else if (query.trim()) {
        router.push(`/search?query=${encodeURIComponent(query)}`);
        setIsOpen(false);
        setQuery("");
        setSelectedIndex(-1);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleSelectSerie = () => {
    setIsOpen(false);
    setQuery("");
  };

  const showDropdown = isOpen && !isOnSearchPage;

  return (
    <div className={styles.container} ref={searchInputRef}>
      <input
        type="text"
        className={`${styles.searchInput} ${isOpen ? styles.searchInputOpen : ""}`}
        placeholder="Search for a serie..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (!isOnSearchPage && query.trim() && results.length > 0) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />
      {/* Icône à gauche */}
      <span className={`${styles.icon} ${styles.glass}`} onClick={handleSearch}>
        <Icon path={mdiMagnify} size={1} />
      </span>
      {/* Séparateur vertical */}
      <div className={styles.separator} />
      {/* Icône effacer à droite */}
      <span className={`${styles.icon} ${styles.delete}`} onClick={() => query && setQuery("")}>
        {query && <Icon path={mdiClose} size={0.8} />}
      </span>
      {/* Liste des résultats */}
      {showDropdown && (
        <div className={styles.resultsContainer}>
          <div className={styles.resultsList}>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => <DynamicSearchResultSkeleton key={index} />)
            ) : results.length > 0 ? (
              <>
                {results.map((serie, index) => (
                  <DynamicSearchResult
                    key={serie.id}
                    serie={serie}
                    onSelect={handleSelectSerie}
                    isSelected={index === selectedIndex}
                  />
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
