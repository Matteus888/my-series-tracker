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
  const pageParam = searchParams.get("page");
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(pageParam ? parseInt(pageParam) : 1);
  const [totalPages, setTotalPages] = useState(0);

  // Réinitialiser currentPage à 1 si la requête change
  useEffect(() => {
    if (query) {
      setCurrentPage(pageParam ? parseInt(pageParam) : 1);
    }
  }, [query, pageParam]);

  useEffect(() => {
    if (!query) return;
    const fetchResults = async () => {
      setLoading(true);
      try {
        const UI_PAGE_SIZE = 36;
        const TMDB_PAGE_SIZE = 20;
        const startIndex = (currentPage - 1) * UI_PAGE_SIZE;
        const endIndex = startIndex + UI_PAGE_SIZE;

        const startTmdbPage = Math.floor(startIndex / TMDB_PAGE_SIZE) + 1;
        const endTmdbPage = Math.floor((endIndex - 1) / TMDB_PAGE_SIZE) + 1;

        const responses = await Promise.all(
          Array.from({ length: endTmdbPage - startTmdbPage + 1 }, (_, i) => searchSeries(query, startTmdbPage + i)),
        );

        const allResults = responses.flatMap((r) => r.results);

        const combinedResults = allResults.slice(
          startIndex % TMDB_PAGE_SIZE,
          (startIndex % TMDB_PAGE_SIZE) + UI_PAGE_SIZE,
        );

        setResults(combinedResults);
        setTotalResults(responses[0].totalResults);

        const calculatedTotalPages = Math.ceil(responses[0].totalResults / UI_PAGE_SIZE);
        setTotalPages(calculatedTotalPages);
      } catch (err) {
        console.error(err);
        setResults([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, currentPage]);

  const handleChangePage = (page) => {
    setCurrentPage(page);
    router.push(`/search?query=${encodeURIComponent(query)}&page=${page}`);
  };

  return (
    <div className="container-fluid mt-0 px-0">
      <div className="row mx-0">
        {/* Espace réservé pour le futur sous-menu de filtres */}
        <div className="col-md-2 d-none d-md-block px-0">
          <p className="mb-2 me-3 text-end">
            {totalResults} results for &quot;{query}&quot;
          </p>
        </div>
        <div className="col-md-10 p-0">
          {loading ? (
            <>
              <div className="cards-container">
                <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-4 row-cols-xl-6 g-0 mx-0 align-items-stretch">
                  {Array.from({ length: 36 }).map((_, index) => (
                    <SerieCardSkeleton key={index} />
                  ))}
                </div>
              </div>
            </>
          ) : results.length > 0 ? (
            <>
              <div className="cards-container">
                <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-4 row-cols-xl-6 g-0 mx-0 align-items-stretch">
                  {results.map((serie) => (
                    <div key={serie.id} className="col p-0">
                      <SerieCard serie={serie} />
                    </div>
                  ))}
                </div>
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handleChangePage} />
            </>
          ) : (
            !loading && <p>No result found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
