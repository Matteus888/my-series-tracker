import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/db.connect";
import { Episode } from "@/models/episode.model";
import { Series } from "@/models/series.model";
import { getTraktEpisodeRating } from "@/lib/api/trakt.api";

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export async function GET(_req, { params }) {
  const { episodeId } = await params;

  try {
    await dbConnect();

    const episode = await Episode.findById(episodeId).select("seriesId seasonNumber episodeNumber ratings").lean();
    if (!episode) return NextResponse.json({ error: "Episode not found" }, { status: 404 });

    // Cache hit : note Trakt fetched récemment
    const cached = episode.ratings?.trakt;
    if (cached?.fetchedAt && Date.now() - new Date(cached.fetchedAt) < THIRTY_DAYS) {
      return NextResponse.json({
        score: cached.score ?? null,
        voteCount: cached.voteCount ?? 0,
      });
    }

    // Cache miss : on fetch
    const series = await Series.findById(episode.seriesId).select("imdbId").lean();
    if (!series?.imdbId) {
      return NextResponse.json({ score: null, voteCount: 0 });
    }

    const rating = await getTraktEpisodeRating(series.imdbId, episode.seasonNumber, episode.episodeNumber);

    // On stocke même si null pour éviter de re-fetcher
    await Episode.findByIdAndUpdate(episodeId, {
      $set: {
        "ratings.trakt.score": rating?.score ?? null,
        "ratings.trakt.voteCount": rating?.voteCount ?? 0,
        "ratings.trakt.fetchedAt": new Date(),
      },
    });

    return NextResponse.json({
      score: rating?.score ?? null,
      voteCount: rating?.voteCount ?? 0,
    });
  } catch (err) {
    console.error("Trakt episode rating error:", err);
    return NextResponse.json({ error: "Failed to fetch rating" }, { status: 500 });
  }
}
