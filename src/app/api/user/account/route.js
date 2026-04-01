import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { User } from "@/models/user.model";
import { updateUserAccount } from "@/lib/api/user.api";

export const PATCH = async (request) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorize" }, { status: 401 });
  try {
    const { username, email } = await request.json();
    await updateUserAccount(User, session.user.id, { username, email });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/user/account error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
