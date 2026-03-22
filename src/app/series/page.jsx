"use client";

import styles from "@/app/series/page.module.css";
import { useEffect, useState } from "react";
import { getAllSeries } from "@/lib/api/tmdb.api";
import SerieCard from "@/components/series/SerieCard";

export default function AllSeriesPage() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      try {
        const allSeries = await getAllSeries();
        setSeries(allSeries);
      } catch (error) {
        console.error("Error fetching all series:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeries();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>All series</h1>
      {loading && <div className={styles.loadingMessage}>Loading...</div>}
      {series.length > 0 ? (
        <div className={styles.seriesGrid}>
          {series.map((serie) => (
            <div key={serie.id} className={styles.gridItem}>
              <SerieCard serie={serie} />
            </div>
          ))}
        </div>
      ) : (
        !loading && <p className={styles.emptyMessage}>No serie found.</p>
      )}
    </div>
  );
}
