"use client";

import styles from "@/app/series/page.module.css";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAllSeries } from "@/lib/api/tmdb.api";
import { getTmdbPagesForUiPage, sliceResultsForUiPage, calcTotalUiPages } from "@/lib/utils/pagination.utils";
import SidebarFilterHeader from "@/components/layout/SidebarFilterHeader/SidebarFilterHeader";
import SortSidebar from "@/components/ui/SortSidebar/SortSidebar";
import SerieCard from "@/components/series/SerieCard/SerieCard";
import SerieCardSkeleton from "@/components/series/SerieCardSkeleton/SerieCardSkeleton";
import Pagination from "@/components/ui/Pagination/Pagination";

export default function AllSeriesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageParam = searchParams.get("page");

  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(pageParam ? parseInt(pageParam) : 1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [sortBy, setSortBy] = useState("popularity.desc");

  useEffect(() => {
    setCurrentPage(pageParam ? parseInt(pageParam) : 1);
  }, [pageParam]);

  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      try {
        const { startIndex, startTmdbPage, endTmdbPage } = getTmdbPagesForUiPage(currentPage);

        const responses = await Promise.all(
          Array.from({ length: endTmdbPage - startTmdbPage + 1 }, (_, i) =>
            getAllSeries(startTmdbPage + i, { sort_by: sortBy }),
          ),
        );

        const allResults = responses.flatMap((r) => r.results);
        const uniqueResults = Array.from(new Map(allResults.map((s) => [s.id, s])).values());
        const combinedResults = sliceResultsForUiPage(uniqueResults, startIndex);

        setSeries(combinedResults);
        setTotalResults(responses[0].totalResults);
        setTotalPages(calcTotalUiPages(responses[0].totalResults));
      } catch (err) {
        console.error("Error fetching all series:", err);
        setSeries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSeries();
  }, [currentPage, sortBy]);

  const handleChangePage = (page) => {
    setCurrentPage(page);
    router.push(`/series?page=${page}`);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
    router.push("/series?page=1");
  };

  return (
    <div className={styles.allSeriesLayout}>
      <div className={styles.filterSidebar}>
        <div className={styles.stickyFilter}>
          <SidebarFilterHeader
            pageName="Series"
            totalResults={totalResults}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={() => handleChangePage(currentPage - 1)}
            onNextPage={() => handleChangePage(currentPage + 1)}
            variant="allSeries"
          />
          <SortSidebar sortBy={sortBy} onSortChange={handleSortChange} />
        </div>
      </div>
      <div className={styles.allSeriesContainer}>
        {loading ? (
          <div className={styles.seriesGrid}>
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className={styles.gridItem}>
                <SerieCardSkeleton />
              </div>
            ))}
          </div>
        ) : series.length > 0 ? (
          <>
            <div className={styles.seriesGrid}>
              {series.map((serie) => (
                <div key={serie.id} className={styles.gridItem}>
                  <SerieCard serie={serie} score={Math.round(serie.vote_average * 10)} />
                </div>
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handleChangePage} />
          </>
        ) : (
          <p className={styles.emptyMessage}>No serie found.</p>
        )}
      </div>
    </div>
  );
}
