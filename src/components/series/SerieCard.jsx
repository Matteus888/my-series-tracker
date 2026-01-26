import Link from "next/link";
import Image from "next/image";

export default function SerieCard({ serie }) {
  return (
    <div className="col mb-4">
      <div className="card h-100 border-0 shadow-sm">
        <Link href={`/series/${serie.id}`} className="text-decoration-none text-dark">
          <div style={{ height: "250px", overview: "hidden" }}>
            <Image
              src={serie.poster_path ? `https://image.tmdb.org/t/p/w500${serie.poster_path}` : "/placeholder.webp"}
              alt={serie.name}
              width={500}
              height={750}
              className="card-img-top img-fluid object-fit-cover"
            />
          </div>
          <div className="card-body p-3">
            <h5 className="card-title mb-1">{serie.name}</h5>
          </div>
        </Link>
        <div className="card-footer bg-white border-top-0 p-3 d-flex justify-content-between align-items-center">
          <button className="btn btn-sm btn-outline-primary">Add to favorites</button>
          <span className="text-muted small">{serie.first_air_date?.substring(0, 4)}</span>
        </div>
      </div>
    </div>
  );
}
