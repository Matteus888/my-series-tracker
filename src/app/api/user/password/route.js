import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { User } from "@/models/user.model";
import { updateUserPassword } from "@/lib/api/user.api";

export const PATCH = async (request) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { currentPassword, newPassword } = await request.json();
    await updateUserPassword(User, session.user.id, { currentPassword, newPassword });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/user/password error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
