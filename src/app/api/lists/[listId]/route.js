import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { UserList } from "@/models/userList.model";
import dbConnect from "@/lib/db/db.connect";

// Récupérer une liste
export const GET = async (request, context) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const { listId } = await context.params;
    const list = await UserList.findOne({
      _id: listId,
      userId: session.user.id,
    }).populate({ path: "series", model: "Series" });
    if (!list) return NextResponse.json({ error: "List not found" }, { status: 404 });
    return NextResponse.json({ list }, { status: 200 });
  } catch (err) {
    console.error("GET /api/lists/[listId] error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

// Modifier une liste
export const PATCH = async (request, context) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const { listId } = await context.params;
    const { name, description, isPublic } = await request.json();
    const list = await UserList.findOneAndUpdate(
      { _id: listId, userId: session.user.id, isDefault: false },
      { $set: { name, description, isPublic } },
      { returnDocument: "after", runValidators: true },
    );
    if (!list) return NextResponse.json({ error: "List not found or cannot be modified" }, { status: 404 });
    return NextResponse.json({ success: true, list }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/lists/[listId] error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

// Supprimer une liste
export const DELETE = async (request, context) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const { listId } = await context.params;
    const list = await UserList.findOneAndDelete({
      _id: listId,
      userId: session.user.id,
      isDefault: false,
    });
    if (!list) return NextResponse.json({ error: "List not found or cannot be deleted" }, { status: 404 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/lists/[listId] error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
