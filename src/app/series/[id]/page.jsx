import Image from "next/image";
import BackButton from "@/components/ui/BackButton";
import { getSeriesDetails } from "@/lib/tmdb";
import { formatDate } from "@/lib/utils/date";

export default async function SeriesPage({ params }) {
  const { id } = await params;

  const serie = await getSeriesDetails(id);
  if (!serie) {
    return <p className="text-center mt-5">Series not found</p>;
  }

  return (
    <>
      <BackButton />
      {/* Spacer */}
      <div style={{ height: "56px" }} />

      {/* Séries détails */}
      <div className="container py-4">
        <div className="card shadow-sm">
          <div className="row g-0">
            <div className="col-md-4">
              <Image
                src={serie.poster_path ? `https://image.tmdb.org/t/p/w500${serie.poster_path}` : "/placeholder.webp"}
                alt={serie.name}
                width={300}
                height={450}
                className="img-fluid rounded-start"
              />
            </div>
            <div className="col-md-8">
              <div className="card-body">
                <h2 className="card-title">{serie.name}</h2>
                {serie.tagline && <p className="fst-italic text-muted">{serie.tagline}</p>}
                <p className="text-muted">First broadcast: {formatDate(serie.first_air_date)}</p>
                <p className="card-text">{serie.overview}</p>
                {serie.genres?.length > 0 && <p>Genres: {serie.genres.map((g) => g.name).join(", ")}</p>}
                <p>Status: {serie.status}</p>
                <p>Seasons: {serie.number_of_seasons}</p>
                <p>Episodes: {serie.number_of_episodes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
