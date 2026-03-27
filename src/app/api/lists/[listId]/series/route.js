import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { UserList } from "@/models/userList.model";
import { Series } from "@/models/series.model";
import dbConnect from "@/lib/db/db.connect";

// Ajouter une série à une liste
export const POST = async (request, context) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const { listId } = await context.params;
    const { tmdbId, serieData } = await request.json();

    const series = await Series.findOneAndUpdate(
      { tmdbId },
      {
        $set: {
          tmdbId,
          title: serieData.name,
          posterPath: serieData.poster_path,
          backdropPath: serieData.backdrop_path,
          overview: serieData.overview,
          firstAirDate: serieData.first_air_date ? new Date(serieData.first_air_date) : null,
          voteAverage: serieData.vote_average,
          voteCount: serieData.vote_count,
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    const list = await UserList.findOneAndUpdate(
      { _id: listId, userId: session.user.id },
      { $addToSet: { series: series._id } },
      { returnDocument: "after" },
    );
    if (!list) return NextResponse.json({ error: "List not found" }, { status: 404 });
    return NextResponse.json({ success: true, list }, { status: 200 });
  } catch (err) {
    console.error("POST /api/lists/[listId]/series error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

// Retirer une série d'une liste
export const DELETE = async (request, context) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const { listId } = await context.params;
    const { seriesId } = await request.json();
    const list = await UserList.findOneAndUpdate(
      { _id: listId, userId: session.user.id },
      { $pull: { series: seriesId } },
      { returnDocument: "after" },
    );
    if (!list) return NextResponse.json({ error: "List not found" }, { status: 404 });
    return NextResponse.json({ success: true, list }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/lists/[listId]/series error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
