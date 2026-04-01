import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { User } from "@/models/user.model";
import { uploadAvatar, updateAvatarUrl } from "@/lib/api/user.api";
import dbConnect from "@/lib/db/db.connect";

export const POST = async (request) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const url = await uploadAvatar(User, session.user.id, buffer);
    return NextResponse.json({ url }, { status: 200 });
  } catch (err) {
    console.error("POST /api/user/avatar error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

export const PATCH = async (request) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { url } = await request.json();
    const cloudinaryUrl = await updateAvatarUrl(User, session.user.id, url);
    return NextResponse.json({ url: cloudinaryUrl }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/user/avatar error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
