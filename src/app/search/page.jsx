"use client";

import { useEffect, useState } from "react";
import { searchSeries } from "@/lib/tmdb";
import SeriesList from "@/components/series/SeriesList";
import { useSearch } from "@/context/SearchContext";

export default function SearchPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  const { query, setQuery, results, setResults, loading, setLoading } = useSearch();

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
        setResults(series);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, setResults, setLoading]);

  // Effet scroll pour rétrécir la barre
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerHeight = isScrolled ? 75 : 104;

  return (
    <>
      {/* Fixed bar avec recherche dynamique */}
      <div className={`fixed-top bg-white shadow-sm sticky-bar ${isScrolled ? "shrink" : ""}`} style={{ zIndex: 1030 }}>
        <div className="container py-3">
          <div className="d-flex flex-column gap-2">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
              <h1 className="h3 fw-bold mb-0 flex-shrink-0">Search for a series</h1>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Start typing a series..."
                    className="form-control"
                  />
                  {/* Loader animé */}
                  <div className={`spinner-slot ${loading ? "visible" : ""}`}>
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </div>
                {/* Badge résultat */}
                <div className="result-slot">
                  {query && !loading && results.length > 0 && (
                    <span className="badge bg-primary d-flex align-items-center">
                      <i className="bi bi-search me-1 fs-6"></i>
                      <span className="fs-7 fw-normal">{results.length} series found</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ height: headerHeight }} />

      {/* Liste de séries */}
      <div className="container py-4">
        {loading && !results.length ? <p className="text-center">Loading...</p> : <SeriesList series={results} />}
      </div>
    </>
  );
}
