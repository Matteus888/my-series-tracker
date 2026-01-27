import Link from "next/link";
import Image from "next/image";
import { FaHeart, FaBookmark, FaCheck } from "react-icons/fa";

export default function SerieCard({ serie }) {
  return (
    <div className="col p-0 m-0 d-flex" style={{ minWidth: "16.6667%", height: "100%", flex: "1 0 auto" }}>
      <div className="card h-100 m-0 border border-dark rounded-0 d-flex flex-column" style={{ width: "100%" }}>
        <div
          className="position-relative w-100 flex-grow-0"
          style={{ aspectRatio: "2/3", overflow: "hidden", backgroundColor: "#f0f0f0" }}
        >
          <Link href={`/series/${serie.id}`} className="text-decoration-none text-dark d-block">
            {serie.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${serie.poster_path}`}
                alt={serie.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="img-fluid"
                style={{ objectFit: "contain" }}
                priority={true}
              />
            ) : (
              <div
                className="d-flex align-items-center justify-content-center h-100 w-100 bg-light text-dark"
                style={{ fontSize: "1.2rem", textAlign: "center" }}
              >
                {serie.name}
              </div>
            )}
          </Link>
        </div>
        <div
          className="card-footer bg-white border-top border-dark p-1 d-flex justify-content-between align-items-center flex-shrink-0"
          style={{ height: "40px", width: "100%", minWidth: "100%" }}
        >
          <div className="d-flex gap-1">
            <button className="btn btn-sm btn-outline-danger p-1">
              <FaCheck />
            </button>
            <button className="btn btn-sm btn-outline-primary p-1">
              <FaBookmark />
            </button>
          </div>
          <div className="d-flex align-items-center gap-1">
            <FaHeart className="text-warning" />
            <span className="small">{Math.round(serie.vote_average * 10)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
