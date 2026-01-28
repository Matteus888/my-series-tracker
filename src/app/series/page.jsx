"use client";

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
    <div className="container mt-4">
      <h1 className="mb-4">All series</h1>
      {loading && <div className="text-center my-3">Loading...</div>}
      {series.length > 0 ? (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {series.map((serie) => (
            <div key={serie.id} className="col">
              <SerieCard serie={serie} />
            </div>
          ))}
        </div>
      ) : (
        !loading && <p>No serie found.</p>
      )}
    </div>
  );
}
