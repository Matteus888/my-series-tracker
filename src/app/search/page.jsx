"use client";

import styles from "@/app/search/page.module.css";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSearch } from "@/context/SearchContext";
import { searchSeries } from "@/lib/api/tmdb.api";
import { getTmdbPagesForUiPage, sliceResultsForUiPage, calcTotalUiPages } from "@/lib/utils/pagination.utils";
import { sortByRelevance } from "@/lib/utils/searchScore.utils";
import SidebarHeader from "@/components/layout/SidebarHeader/SidebarHeader";
import SerieCard from "@/components/series/SerieCard/SerieCard";
import SerieCardSkeleton from "@/components/series/SerieCardSkeleton/SerieCardSkeleton";
import Pagination from "@/components/ui/Pagination/Pagination";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const pageParam = searchParams.get("page");
  const router = useRouter();
  const { query: ctxQuery, setQuery: setCtxQuery } = useSearch();

  // Marque le 1er rendu : on n'écrase l'input que sur le 1er chargement
  // (ex: navigation depuis le dropdown), jamais ensuite.
  const hasInitialized = useRef(false);

  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(pageParam ? parseInt(pageParam) : 1);
  const [totalPages, setTotalPages] = useState(0);

  // Sync : si on arrive sur /search avec ?query=xxx (ex: depuis le dropdown ailleurs),
  // on remplit l'input. Et inversement, si l'input est déjà rempli en arrivant, on
  // ne touche à rien.
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    if (query && query !== ctxQuery) {
      setCtxQuery(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Quand on quitte la page /search, on reset l'input pour ne pas garder la query partout
  useEffect(() => {
    return () => {
      setCtxQuery("");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (query) {
      setCurrentPage(pageParam ? parseInt(pageParam) : 1);
    }
  }, [query, pageParam]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setTotalResults(0);
      setTotalPages(0);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const { startIndex, startTmdbPage, endTmdbPage } = getTmdbPagesForUiPage(currentPage);

        const responses = await Promise.all(
          Array.from({ length: endTmdbPage - startTmdbPage + 1 }, (_, i) => searchSeries(query, startTmdbPage + i)),
        );

        const allResults = responses.flatMap((r) => r.results);
        const uniqueResults = Array.from(new Map(allResults.map((s) => [s.id, s])).values());
        const sorted = sortByRelevance(uniqueResults, query);

        setResults(sliceResultsForUiPage(sorted, startIndex));
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
          <SidebarHeader
            query={query}
            pageName="Search"
            totalResults={totalResults}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={() => handleChangePage(currentPage - 1)}
            onNextPage={() => handleChangePage(currentPage + 1)}
            variant="search"
          />
        </div>
      </div>
      <div className={styles.resultsArea}>
        {loading ? (
          <div className={styles.seriesGrid}>
            <div className={styles.gridRow}>
              {Array.from({ length: 36 }).map((_, index) => (
                <SerieCardSkeleton key={index} />
              ))}
            </div>
          </div>
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
        ) : query ? (
          <p className={styles.emptyMessage}>No result found.</p>
        ) : (
          <p className={styles.emptyMessage}>Type something to search.</p>
        )}
      </div>
    </div>
  );
}
