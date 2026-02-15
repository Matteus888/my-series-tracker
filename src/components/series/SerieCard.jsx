import Link from "next/link";
import Image from "next/image";

export default function SerieCard({ serie }) {
  return (
    <div
      className="col p-0 m-0 h-100 d-flex tooltip-wrapper position-relative"
      style={{ minWidth: "16.6667%", flex: "1 0 auto" }}
    >
      {/* Tooltip */}
      <div
        className="position-absolute bottom-100 start-50 translate-middle-x mb-1 rounded px-2 py-1 pe-none custom-tooltip"
        style={{ zIndex: 1021 }}
      >
        {serie.name}
      </div>
      <div className="card hover-card h-100 w-100 m-0 rounded-0 d-flex flex-column position-relative overflow-visible">
        <div className="position-relative w-100 flex-grow-0 d-flex" style={{ aspectRatio: "2/3", overflow: "hidden" }}>
          <Link href={`/series/${serie.id}`} className="position-relative d-flex w-100">
            {serie.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${serie.poster_path}`}
                alt={serie.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="img-fluid position-relative"
                priority={true}
              />
            ) : (
              <div className="d-flex align-items-end w-100 h-100 p-2 text-start">{serie.name}</div>
            )}

            {/* Badge année */}
            {serie.first_air_date && (
              <span className="year-badge position-absolute px-2 py-1 fw-bold">{serie.first_air_date.slice(0, 4)}</span>
            )}
          </Link>
        </div>
        <div
          className="card-footer hover-footer border-top-0 rounded-0 p-0 d-flex justify-content-between align-items-center flex-shrink-0"
          style={{ height: "40px", minWidth: "100%" }}
        >
          <div className="d-flex h-100">
            <button
              className="btn check rounded-0 px-2 py-0 d-flex align-items-center justify-content-center"
              style={{
                height: "100%",
                width: "30px",
                minWidth: "30px",
              }}
            >
              <i className="bi bi-check-square"></i>
            </button>
            <button
              className="btn bookmark rounded-0 px-2 py-0 d-flex align-items-center justify-content-center"
              style={{
                height: "100%",
                width: "30px",
                minWidth: "30px",
              }}
            >
              <i className="bi bi-plus-square"></i>
            </button>
          </div>
          <div className="d-flex align-items-center gap-1 pe-1">
            {serie.vote_average > 0 && (
              <>
                <i className="bi bi-heart text-danger"></i>
                <span className="small">{Math.round(serie.vote_average * 10)}%</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
