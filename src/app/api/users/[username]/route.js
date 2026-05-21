import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { User } from "@/models/user.model";
import { getUserPublicProfile, getUserStats, getUserProfileAggregations } from "@/lib/api/user.api";
import { getTrackedSeries, getSeriesProgress } from "@/lib/api/series.api";
import { getContinueWatching, getRecentlyWatchedFlat } from "@/lib/api/episode.api";

export const GET = async (request, { params }) => {
  const { username } = await params;
  const session = await getServerSession(authOptions);
  const viewerUserId = session?.user?.id ?? null;

  try {
    // 1. Profil de base + check de privacy
    const profile = await getUserPublicProfile(User, username, viewerUserId);
    const { isOwner } = profile;

    // 2. Stats globales — toujours visibles si profil public
    const stats = await getUserStats(User, profile._id);

    // 3. Tracked series + progress — soumis à publicLists
    let trackedSeries = [];
    let progressMap = {};
    if (isOwner || profile.publicLists) {
      const tracked = await getTrackedSeries(User, profile._id);
      trackedSeries = tracked.map((t) => ({
        tmdbId: t.tmdbId,
        status: t.status,
        isFavorite: t.isFavorite,
        rating: t.rating ?? null,
        series: t.seriesId
          ? {
              _id: t.seriesId._id.toString(),
              tmdbId: t.seriesId.tmdbId,
              title: t.seriesId.title,
              posterPath: t.seriesId.posterPath ?? null,
              backdropPath: t.seriesId.backdropPath ?? null,
              firstAirDate: t.seriesId.firstAirDate ? t.seriesId.firstAirDate.toISOString() : null,
              status: t.seriesId.status ?? null,
              genres: t.seriesId.genres ?? [],
              ratings: t.seriesId.ratings ?? null,
              voteAverage: t.seriesId.ratings?.tmdb?.score ?? null,
            }
          : null,
      }));

      const progressArr = await getSeriesProgress(profile._id, User);
      progressMap = Object.fromEntries(progressArr.map((p) => [String(p.tmdbId), p]));
    }

    // 4. Recently watched + continue watching — soumis à publicActivity
    let recentlyWatched = [];
    let continueWatching = [];
    if (isOwner || profile.publicActivity) {
      recentlyWatched = await getRecentlyWatchedFlat(profile._id);
      continueWatching = await getContinueWatching(User, profile._id);
    }

    // 5. Aggregations — toujours visibles si profil public
    const aggregations = await getUserProfileAggregations(User, profile._id);

    return NextResponse.json(
      {
        profile,
        stats,
        trackedSeries,
        progressMap,
        recentlyWatched,
        continueWatching,
        aggregations,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error(`GET /api/users/${username} error:`, err.message);

    if (err.message === "User not found." || err.message === "Private profile.") {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
