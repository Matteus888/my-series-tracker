import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Series from "@/models/series.model";
import { fetchSerieFromTMDB } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  try {
    const url = request.url;
    const segments = url.split("/");
    const tmdbIdStr = segments[segments.length - 1];
    const tmdbIdNum = parseInt(tmdbIdStr);

    if (isNaN(tmdbIdNum)) {
      return NextResponse.json({ message: "ID TMDB invalide." }, { status: 400 });
    }

    await connectToDB();

    // Recherche en BDD
    const existing = await Series.findOne({ tmdbId: tmdbIdNum });
    if (existing) return NextResponse.json(existing, { status: 200 });

    // Sinon on va sur TMDB
    try {
      const tmdbSerie = await fetchSerieFromTMDB(tmdbIdNum);

      const newSerie = new Series({
        tmdbId: tmdbSerie.id,
        title: tmdbSerie.name,
        overview: tmdbSerie.overview,
        posterPath: tmdbSerie.poster_path,
        genres: tmdbSerie.genres.map((g) => g.name),
        releaseDate: tmdbSerie.first_air_date,
        numberOfSeasons: tmdbSerie.number_of_seasons,
        status: tmdbSerie.status,
      });

      await newSerie.save();

      return NextResponse.json(newSerie, { status: 201 });
    } catch (error) {
      console.error("Erreur TMDB :", error);
      return NextResponse.json({ message: "Série introuvable sur TMDB ou problème d'API." }, { status: 404 });
    }
  } catch (error) {
    console.error("Erreur GET /series/:tmdbId", error);
    return NextResponse.json({ message: "Erreur lors de la récupération de la série." }, { status: 500 });
  }
}
