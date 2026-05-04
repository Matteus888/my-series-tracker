import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchSeriesVideos } from "@/lib/api/series.api";
import { NextResponse } from "next/server";

export const GET = async (_req, { params }) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { tmdbId } = await params;
    const videos = await fetchSeriesVideos(tmdbId);
    return NextResponse.json({ videos }, { status: 200 });
  } catch (err) {
    console.error("GET /api/series/[id]/videos error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
