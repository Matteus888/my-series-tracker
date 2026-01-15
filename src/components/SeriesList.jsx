import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils/date";

export default function SeriesList({ series }) {
  if (!series || series.length === 0) {
    return <p className="text-center text-muted">No series found.</p>;
  }

  return (
    <div className="container">
      <div className="row g-4">
        {series.map((serie) => (
          <div key={serie.id} className="col-12 col-lg-6">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex">
                <div className="me-3 flex-shrink-0">
                  <Image
                    src={serie.poster_path ? `https://image.tmdb.org/t/p/w500${serie.poster_path}` : "/placeholder.jpg"}
                    alt={serie.name}
                    width={80}
                    height={120}
                    className="rounded"
                  />
                </div>
                <div className="d-flex flex-column overflow-hidden">
                  <h6 className="fw-bold text-truncate mb-1">{serie.name}</h6>
                  <small className="text-muted mb-2">
                    First broadcast: {}
                    {formatDate(serie.first_air_date)}
                  </small>
                  <Link href={`/series/${serie.id}`} className="mt-auto link-primary text-decoration-none">
                    View details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
