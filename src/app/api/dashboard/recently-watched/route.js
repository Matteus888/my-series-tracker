import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getRecentlyWatched } from "@/lib/api/episode.api";

export const GET = async () => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const recentlyWatched = await getRecentlyWatched(session.user.id);
    return NextResponse.json({ recentlyWatched }, { status: 200 });
  } catch (err) {
    console.error("GET /api/dashboard/recently-watched error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
