import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getContinueWatching } from "@/lib/api/episode.api";
import { User } from "@/models/user.model";

export const GET = async () => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const continueWatching = await getContinueWatching(User, session.user.id);
    return NextResponse.json({ continueWatching }, { status: 200 });
  } catch (err) {
    console.error("GET /api/dashboard/continue-watching error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
