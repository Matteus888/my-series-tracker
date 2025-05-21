import { NextRequest, NextResponse } from "next/server";
import { searchSeriesOnTMDB } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query || query.trim() === "") {
    return NextResponse.json({ message: "Le paramètre query est requis." }, { status: 400 });
  }

  try {
    const results = await searchSeriesOnTMDB(query);
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ message: "Erreur lors de la recherche des séries.", error: err.message }, { status: 500 });
  }
}
