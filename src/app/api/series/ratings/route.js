import { NextResponse } from "next/server";
import { Series } from "@/models/series.model";
import dbConnect from "@/lib/db/db.connect";

export const POST = async (request) => {
  try {
    await dbConnect();
    const { tmdbIds } = await request.json();

    const series = await Series.find({ tmdbId: { $in: tmdbIds } }, { tmdbId: 1, ratings: 1 });

    const ratingsMap = {};
    series.forEach((s) => {
      ratingsMap[s.tmdbId] = s.ratings;
    });

    return NextResponse.json({ ratingsMap }, { status: 200 });
  } catch (err) {
    console.error("POST /api/series/ratings error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
