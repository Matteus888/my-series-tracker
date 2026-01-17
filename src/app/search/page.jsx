"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { searchSeries } from "@/lib/tmdb";
import SerieCard from "@/components/series/SerieCard";

export default function SearchPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  useEffect(() => {
    if (query) {
      const fetchResults = async () => {
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
      };
      fetchResults();
    }
  }, [query]);

  return (
    <div className="container mt-4" style={{ minHeight: "calc(100vh - 100px)" }}>
      <h1 className="mb-4">Results for &quot;{query}&quot;</h1>
      {loading && <div className="text-center my-3">Loading...</div>}
      {results.length > 0 ? (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {results.map((serie) => (
            <div key={serie.id} className="col mb-4">
              <SerieCard serie={serie} />
            </div>
          ))}
        </div>
      ) : (
        !loading && <p>No result found.</p>
      )}
    </div>
  );
}
