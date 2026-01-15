"use client";

import { useState } from "react";
import { searchSeries } from "@/lib/tmdb";
import SeriesList from "@/components/SeriesList";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    const series = await searchSeries(query);
    setResults(series);
    setLoading(false);
  };

  return (
    <>
      <div className="position-sticky top-0 bg-white shadow-sm" style={{ zIndex: 1000 }}>
        <div className="container py-3">
          <h1 className="h3 fw-bold mb-4">Search for a series</h1>
          <form onSubmit={handleSearch} className="d-flex gap-2 mb-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter the name of a series..."
              className="form-control"
            />
            <button className="btn btn-primary">Search</button>
          </form>
          {results.length > 0 && (
            <div>
              <span className="badge bg-primary d-flex align-items-center">
                <i className="bi bi-search me-1 fs-6"></i>
                <span className="fs-7 fw-normal">{results.length} series found</span>
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="container py-4">
        {loading ? <p className="text-center">Loading...</p> : <SeriesList series={results} />}
      </div>
    </>
  );
}
