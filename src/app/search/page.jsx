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
    if (query) {
      const fetchResults = async () => {
        setLoading(true);
        try {
          const tmdbPage1 = currentPage * 2 - 1;
          const tmdbPage2 = currentPage * 2;

          const [page1, page2] = await Promise.all([searchSeries(query, tmdbPage1), searchSeries(tmdbPage2)]);

          const combinedResults = [...page1.results, ...page2.results.slice(0, 4)];
          setResults(combinedResults);

          const totalResults = page1.totalResults;
          const calculatedTotalPages = Math.ceil(totalResults / 24);
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
    }
  }, [query, currentPage]);

  const handleChangePage = (page) => {
    setCurrentPage(page);
    router.push(`/search?query=${encodeURIComponent(query)}&page=${page}`);
  };

  return (
    <div className="container-fluid mt-4 px-0">
      <div className="row mx-0">
        {/* Espace réservé pour le futur sous-menu de filtres */}
        <div className="col-md-2 d-none d-md-block px-0">{/* Futur composant de filtres */}</div>
        <div className="col-md-10 p-0">
          <h1 className="mb-4">Results for &quot;{query}&quot;</h1>
          {loading ? (
            <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 g-0 mx-0 align-items-stretch">
              {Array.from({ length: 24 }).map((_, index) => (
                <SerieCardSkeleton key={index} />
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="cards-container">
                <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 g-0 mx-0 align-items-stretch">
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
