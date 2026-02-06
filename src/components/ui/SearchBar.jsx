"use client";

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
    <div className="position-relative me-3 flex-grow-1" ref={searchInputRef} style={{ minWidth: "300px" }}>
      <input
        type="text"
        className={`form-control custom-search-input py-1 ${isOpen ? "rounded-bottom-0" : "rounded"}`}
        style={{ paddingLeft: "3.5rem" }}
        placeholder="Search for a serie..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setIsOpen(!!results.length)}
        onKeyDown={handleKeyDown}
      />
      {/* Icône à gauche */}
      <i
        className={`bi position-absolute top-50 translate-middle-y ${query ? "bi-x-lg text-dark" : "bi-search text-dark"}`}
        style={{
          left: "12px",
          cursor: query ? "pointer" : "default",
          fontSize: "1rem",
          userSelect: "none",
          marginLeft: "0.15rem",
        }}
        onClick={() => query && setQuery("")}
      />
      {/* Séparateur vertical */}
      <div
        className="position-absolute top-50 ms-1 translate-middle-y"
        style={{
          left: "36px",
          height: "100%",
          width: "1px",
          backgroundColor: "var(--border)",
          pointerEvents: "none",
        }}
      />

      {/* Liste des résultats */}
      {isOpen && (
        <div
          className="position-absolute p-0"
          style={{
            zIndex: 1050,
            width: "calc(100% - 2px)",
            maxHeight: "660px",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            overflow: "hidden",
            borderTopLeftRadius: "0",
            borderTopRightRadius: "0",
            borderBottomLeftRadius: ".375rem",
            borderBottomRightRadius: ".375rem",
          }}
        >
          <div className="list-group m-0 p-0 border-0 w-100" style={{ borderBottomLeftRadius: "20px" }}>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => <DynamicSearchResultSkeleton key={index} />)
            ) : results.length > 0 ? (
              <>
                {results.map((serie) => (
                  <DynamicSearchResult key={serie.id} serie={serie} onSelect={handleSelectSerie} />
                ))}
                <div
                  className="list-group-item text-center text-muted p-1 border-0"
                  style={{
                    fontSize: "0.7rem",
                    backgroundColor: "white",
                    borderBottomLeftRadius: ".375rem",
                    borderBottomRightRadius: ".375rem",
                  }}
                >
                  {totalResults} result{totalResults > 1 ? "s" : ""} found
                </div>
              </>
            ) : (
              <div
                className="list-group-item text-center text-dark p-2 border-0"
                style={{
                  fontSize: "0.7rem",
                  borderTopLeftRadius: "0",
                  borderTopRightRadius: "0",
                  borderBottomLeftRadius: ".375rem",
                  borderBottomRightRadius: ".375rem",
                }}
              >
                No result found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
