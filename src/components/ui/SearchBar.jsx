"use client";

import { useEffect, useRef } from "react";
import { useSearch } from "@/context/SearchContext";
import { searchSeries } from "@/lib/api/tmdb.api";
import { useRouter } from "next/navigation";
import DynamicSerieCard from "../series/DynamicSerieCard";
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
    <div className="position-relative me-3 flex-grow-1" ref={searchInputRef} style={{ minWidth: "350px" }}>
      <input
        type="text"
        className="form-control custom-focus pe-5 py-1"
        placeholder="Search for a serie..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setIsOpen(!!results.length)}
        onKeyDown={handleKeyDown}
      />
      {loading && (
        <div className="position-absolute top-50 end-0 translate-middle-y me-2">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      {isOpen && (
        <div
          className="position-absolute start-0 bg-white shadow-lg p-0"
          style={{
            zIndex: 1050,
            width: "97%",
            maxHeight: "400px",
            overflowY: "auto",
            top: "100%",
          }}
        >
          <div className="list-group m-0 p-0" style={{ width: "100%" }}>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => <DynamicSearchResultSkeleton key={index} />)
            ) : results.length > 0 ? (
              results.map((serie) => <DynamicSerieCard key={serie.id} serie={serie} />)
            ) : (
              <div className="p-3 text-center">No result found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
