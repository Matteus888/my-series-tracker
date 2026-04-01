import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { User } from "@/models/user.model";
import { UserList } from "@/models/userList.model";
import { EpisodeProgress } from "@/models/episodeProgress.model";
import { getUserProfile, deleteUser } from "@/lib/api/user.api";

export const GET = async () => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const user = await getUserProfile(User, session.user.id);
    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("GET /api/user error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

export const DELETE = async () => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await deleteUser(User, UserList, EpisodeProgress, session.user.id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/user error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
