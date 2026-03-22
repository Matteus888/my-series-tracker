"use client";

import styles from "@/app/search/page.module.css";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchSeries } from "@/lib/api/tmdb.api";
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
        const UI_PAGE_SIZE = 36;
        const TMDB_PAGE_SIZE = 20;

        // Index globaux sur tous les résultats
        const startIndex = (currentPage - 1) * UI_PAGE_SIZE;
        const endIndex = startIndex + UI_PAGE_SIZE;

        // Calcul de la 1ère et de la dernière pages TMDB nécessaires
        const startTmdbPage = Math.floor(startIndex / TMDB_PAGE_SIZE) + 1;
        const endTmdbPage = Math.floor((endIndex - 1) / TMDB_PAGE_SIZE) + 1;

        // Récupération des pages TMDB correspondantes (2 ou 3 pages)
        const responses = await Promise.all(
          Array.from({ length: endTmdbPage - startTmdbPage + 1 }, (_, i) => searchSeries(query, startTmdbPage + i)),
        );

        // Fusion des résultats des pages TMDB demandées
        const allResults = responses.flatMap((r) => r.results);

        // Déduplication par ID
        const uniqueResults = Array.from(new Map(allResults.map((serie) => [serie.id, serie])).values());

        // Découpage selon les index globaux
        const combinedResults = uniqueResults.slice(
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
    <div className={styles.searchLayout}>
      <div className={styles.filterSidebar}>
        <div className={styles.stickyFilter}>
          <SearchFilterHeader
            query={query}
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
                  <div key={index} className={styles.gridColumn}>
                    <SerieCardSkeleton />
                  </div>
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
                    <SerieCard serie={serie} />
                  </div>
                ))}
              </div>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handleChangePage} />
          </>
        ) : (
          !loading && <p className={styles.emptyMessage}>No result found.</p>
        )}
      </div>
    </div>
  );
}
