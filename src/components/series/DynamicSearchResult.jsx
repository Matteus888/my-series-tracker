import Link from "next/link";
import Image from "next/image";
import { useSearch } from "@/context/SearchContext";

export default function DynamicSearchResult({ serie }) {
  const { setIsOpen } = useSearch();

  const handleClick = () => {
    setIsOpen(false);
  };

  return (
    <Link href={`/series/${serie.id}`} className="text-decoration-none text-dark" onClick={handleClick}>
      <div className="list-group-item list-group-item-action border-0 border-bottom p-0" style={{ height: "60px" }}>
        <div className="d-flex align-items-center">
          <div className="me-3 overflow-hidden" style={{ width: "40px", height: "60px", flexShrink: 0 }}>
            <Image
              src={serie.poster_path ? `https://image.tmdb.org/t/p/w92${serie.poster_path}` : "/placeholder.webp"}
              alt={serie.name}
              width={40}
              height={60}
              className="img-fluid object-fit-cover w-100 h-100"
            />
          </div>
          <div className="overflow-hidden pe-1 pt-1" style={{ height: "60px" }}>
            <p className="m-0 fw-bold text-truncate" style={{ fontSize: "0.8rem" }}>
              {serie.name}
            </p>
            <p className="m-0 text-muted text-truncate" style={{ fontSize: "0.7rem" }}>
              {serie.first_air_date ? serie.first_air_date.split("-")[0] : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
