import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCalendar } from "@/lib/api/episode.api";
import { User } from "@/models/user.model";

export const GET = async () => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const calendar = await getCalendar(User, session.user.id);
    return NextResponse.json({ calendar }, { status: 200 });
  } catch (err) {
    console.error("GET /api/calendar error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
