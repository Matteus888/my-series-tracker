import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getEpisodeProgressForSeries } from "@/lib/api/series.api";
import { Series } from "@/models/series.model";
import dbConnect from "@/lib/db/db.connect";

export const GET = async (request, context) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const { tmdbId } = await context.params;
    const seriesDoc = await Series.findOne({ tmdbId: Number(tmdbId) }).lean();
    if (!seriesDoc) return NextResponse.json({ episodes: [] }, { status: 200 });

    const raw = await getEpisodeProgressForSeries(session.user.id, seriesDoc._id);
    const episodes = raw.map((ep) => ({
      ...ep,
      _id: ep._id.toString(),
      seriesId: ep.seriesId.toString(),
      watchedAt: ep.watchedAt ? ep.watchedAt.toISOString() : null,
      airDate: ep.airDate ? ep.airDate.toISOString() : null,
      createdAt: ep.createdAt ? ep.createdAt.toISOString() : null,
      updatedAt: ep.updatedAt ? ep.updatedAt.toISOString() : null,
    }));

    return NextResponse.json({ episodes }, { status: 200 });
  } catch (err) {
    console.error("GET /api/series/[tmdbId]/progress error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
