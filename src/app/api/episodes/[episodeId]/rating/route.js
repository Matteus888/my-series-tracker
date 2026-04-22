import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { rateEpisode } from "@/lib/api/episode.api";

export const PATCH = async (request, context) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { episodeId } = await context.params;
    const { rating } = await request.json();

    const result = await rateEpisode(session.user.id, episodeId, rating);
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/episodes/[episodeId]/rating error:", err.message);
    const status = err.message.includes("not found") || err.message.includes("must be watched") ? 400 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
};
