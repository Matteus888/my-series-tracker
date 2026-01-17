"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/context/SearchContext";
import { searchSeries } from "@/lib/tmdb";
import SerieCard from "../series/SerieCard";

export default function Header() {
  const { query, setQuery, results, setResults, loading, setLoading, isOpen, setIsOpen } = useSearch();
  const searchInputRef = useRef(null);
  const router = useRouter();

  // Recherche live avec debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const series = await searchSeries(query);
        setResults(series.slice(0, 10));
        setIsOpen(true);
      } catch (err) {
        console.error(err);
        setResults([]);
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
  }, []);

  // Redirection page search quand "Enter"
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <header className="bg-light p-1 border-bottom position-sticky top-0" style={{ zIndex: 1020 }}>
      <div className="container d-flex justify-content-start">
        <div className="position-relative" ref={searchInputRef} style={{ width: "35%" }}>
          <input
            type="text"
            className="form-control custom-focus pe-5 py-1"
            placeholder="Search for a serie..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(!!results.length)}
            onKeyDown={handleKeyDown}
          />
          {loading && (
            <div className="position-absolute top-50 end-0 translate-middle-y me-2">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          {isOpen && results.length > 0 && (
            <div
              className="mt-2 ms-1 position-absolute bg-white shadow-lg p-0"
              style={{
                zIndex: 1050,
                width: "97%",
              }}
            >
              <div className="list-group" style={{ maxHeight: "none", overflow: "visible" }}>
                {results.map((serie) => (
                  <SerieCard key={serie.id} serie={serie} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
