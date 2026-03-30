"use client";

import styles from "@/app/search/page.module.css";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchSeries } from "@/lib/api/tmdb.api";
import { getTmdbPagesForUiPage, sliceResultsForUiPage, calcTotalUiPages } from "@/lib/utils/pagination.utils";
import SearchFilterHeader from "@/components/layout/SearchFilterHeader";
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
        const { startIndex, startTmdbPage, endTmdbPage } = getTmdbPagesForUiPage(currentPage);

        const responses = await Promise.all(
          Array.from({ length: endTmdbPage - startTmdbPage + 1 }, (_, i) => searchSeries(query, startTmdbPage + i)),
        );

        const allResults = responses.flatMap((r) => r.results);
        const uniqueResults = Array.from(new Map(allResults.map((s) => [s.id, s])).values());

        setResults(sliceResultsForUiPage(uniqueResults, startIndex));
        setTotalResults(responses[0].totalResults);
        setTotalPages(calcTotalUiPages(responses[0].totalResults));
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
    <div className={styles.searchLayout}>
      <div className={styles.filterSidebar}>
        <div className={styles.stickyFilter}>
          <SearchFilterHeader
            query={query}
            pageName="Search"
            totalResults={totalResults}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={() => handleChangePage(currentPage - 1)}
            onNextPage={() => handleChangePage(currentPage + 1)}
          />
        </div>
      </div>
      <div className={styles.resultsArea}>
        {loading ? (
          <>
            <div className={styles.seriesGrid}>
              <div className={styles.gridRow}>
                {Array.from({ length: 36 }).map((_, index) => (
                  <SerieCardSkeleton key={index} />
                ))}
              </div>
            </div>
          </>
        ) : results.length > 0 ? (
          <>
            <div className={styles.seriesGrid}>
              <div className={styles.gridRow}>
                {results.map((serie) => (
                  <div key={serie.id} className={styles.gridColumn}>
                    <SerieCard serie={serie} score={Math.round(serie.vote_average * 10)} />
                  </div>
                ))}
              </div>
            </div>
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handleChangePage} />
            )}
          </>
        ) : (
          !loading && <p className={styles.emptyMessage}>No result found.</p>
        )}
      </div>
    </div>
  );
}
