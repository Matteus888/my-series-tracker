import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { markEpisodeWatched } from "@/lib/api/episode.api";
import { Episode } from "@/models/episode.model";

export const PATCH = async (request, context) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { episodeId } = await context.params;
    const { watched = true } = await request.json();
    const result = await markEpisodeWatched(Episode, session.user.id, episodeId, watched);
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/episodes/[episodeId]/watched error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
