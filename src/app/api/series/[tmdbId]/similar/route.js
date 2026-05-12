import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/api/tmdb.api";

export const GET = async (request, { params }) => {
  const { tmdbId } = await params;

  try {
    const items = await getRecommendations(Number(tmdbId));
    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error(`GET /api/series/${tmdbId}/similar error:`, err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
