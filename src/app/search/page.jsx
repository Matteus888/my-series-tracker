"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchSeries } from "@/lib/api/tmdb.api";
import SerieCard from "@/components/series/SerieCard";
import SerieCardSkeleton from "@/components/series/SerieCardSkeleton";
import Pagination from "@/components/ui/Pagination";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (query) {
      const fetchResults = async () => {
        setLoading(true);
        try {
          const data = await searchSeries(query, currentPage);
          setResults(data.results);
          setTotalPages(data.totalPages);
        } catch (err) {
          console.error(err);
          setResults([]);
          setTotalPages(0);
        } finally {
          setLoading(false);
        }
      };
      fetchResults();
    }
  }, [query, currentPage]);

  const handleChangePage = (page) => {
    setCurrentPage(page);
    router.push(`/search?query=${encodeURIComponent(query)}&page=${page}`);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Results for &quot;{query}&quot;</h1>
      {loading ? (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {Array.from({ length: 20 }).map((_, index) => (
            <SerieCardSkeleton key={index} />
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {results.map((serie) => (
              <SerieCard key={serie.id} serie={serie} />
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handleChangePage} />
        </>
      ) : (
        !loading && <p>No result found.</p>
      )}
    </div>
  );
}
