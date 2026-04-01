import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { User } from "@/models/user.model";
import { updateUserPrivacy } from "@/lib/api/user.api";

export const PATCH = async (request) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { isPublic, publicLists, publicActivity } = await request.json();
    await updateUserPrivacy(User, session.user.id, { isPublic, publicLists, publicActivity });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/user/privacy error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
