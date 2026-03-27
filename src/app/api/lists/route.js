import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { UserList } from "@/models/userList.model";
import dbConnect from "@/lib/db/db.connect";

// Récupérer toutes les listes de l'utilisateur
export const GET = async () => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const lists = await UserList.find({ userId: session.user.id })
      .populate({ path: "series", model: "Series" })
      .sort({ isDefault: -1, createdAt: 1 });
    return NextResponse.json({ lists }, { status: 200 });
  } catch (err) {
    console.error("GET /api/lists error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

// Créer une nouvelle liste
export const POST = async (request) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const { name, description, isPublic } = await request.json();
    const list = await UserList.create({
      userId: session.user.id,
      name,
      description,
      isPublic: isPublic || false,
      isDefault: false,
    });
    return NextResponse.json({ success: true, list }, { status: 201 });
  } catch (err) {
    console.error("POST /api/lists error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
