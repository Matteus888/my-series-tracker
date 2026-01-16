import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils/date";

export default function SerieCard({ serie }) {
  return (
    <Link href={`/series/${serie.id}`} className="text-decoration-none text-dark">
      <div className="list-group-item list-group-item-action border-0 border-bottom p-0" style={{ height: "60px" }}>
        <div className="d-flex align-items-center">
          <div className="me-3" style={{ width: "40px", height: "60px", flexShrink: 0 }}>
            <Image
              src={serie.poster_path ? `https://image.tmdb.org/t/p/w92${serie.poster_path}` : "/placeholder.webp"}
              alt={serie.name}
              width={40}
              height={60}
              className="img-fluid object-fit-contain"
            />
          </div>
          <div className="" style={{ height: "60px" }}>
            <h6 className="mb-0 small">{serie.name}</h6>
            <p className="mb-0 smaller text-muted" style={{ fontSize: "0.75rem" }}>
              {formatDate(serie.first_air_date)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
