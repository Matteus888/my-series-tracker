"use client";

import { useEffect, useRef } from "react";
import { useSearch } from "@/context/SearchContext";
import { searchSeries } from "@/lib/api/tmdb.api";
import { useRouter } from "next/navigation";
import DynamicSearchResult from "../series/DynamicSearchResult";
import DynamicSearchResultSkeleton from "./DynamicSearchResultSkeleton";

export default function SearchBar() {
  const { query, setQuery, results, setResults, loading, setLoading, isOpen, setIsOpen } = useSearch();
  const searchInputRef = useRef(null);
  const router = useRouter();

  // Recherche live avec debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchSeries(query, 1);
        setResults(data.results.slice(0, 10));
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
    }
  };

  return (
    <div className="position-relative me-3 flex-grow-1" ref={searchInputRef} style={{ minWidth: "300px" }}>
      <input
        type="text"
        className={`form-control custom-search-input px-2 py-1 ${isOpen ? "rounded-bottom-0" : "rounded"}`}
        placeholder="Search for a serie..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setIsOpen(!!results.length)}
        onKeyDown={handleKeyDown}
      />
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
            borderBottomLeftRadius: ".375rem",
            borderBottomRightRadius: ".375rem",
            overflow: "hidden",
          }}
        >
          <div className="list-group m-0 p-0 border-0 w-100" style={{ borderBottomLeftRadius: "20px" }}>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => <DynamicSearchResultSkeleton key={index} />)
            ) : results.length > 0 ? (
              results.map((serie) => <DynamicSearchResult key={serie.id} serie={serie} />)
            ) : (
              <div className="p-3 text-center">No result found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
