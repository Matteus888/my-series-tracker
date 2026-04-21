import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getSeriesProgress } from "@/lib/api/series.api";
import { NextResponse } from "next/server";
import { User } from "@/models/user.model";

export const GET = async () => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const progress = await getSeriesProgress(session.user.id, User);
    return NextResponse.json({ progress }, { status: 200 });
  } catch (err) {
    console.error("GET /api/series/progress error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
