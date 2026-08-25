import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/db.connect";
import { Series } from "@/models/series.model";
import { ensureSeriesInDb } from "@/lib/api/series.api";

export const maxDuration = 60;

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const activeSeries = await Series.find({
    status: { $in: ["Returning Series", "In Production", " Planned", "Pilot"] },
  })
    .select("tmdbId title")
    .lean();

  const results = [];
  for (const s of activeSeries) {
    try {
      await ensureSeriesInDb(Series, s.tmdbId, { force: true });
      results.push({ tmdbId: s.tmdbId, ok: true });
    } catch (err) {
      console.error(`Cron sync failed for ${s.title}:`, err.message);
      results.push({ tmdbId: s.tmdbId, ok: false, error: err.message });
    }
  }

  return NextResponse.json({ synced: results.length, results });
}
