import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { addTrackedSeries, getTrackedSeries, removeTrackedSeries } from "@/lib/api/series.api";
import { User } from "@/models/user.model";
import { Series } from "@/models/series.model";

// Ajouter une série au suivi
export const POST = async (request) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { seriesId, serieData, status, isFavorite, rating, markAllWatched } = await request.json();
    const trackedSeries = await addTrackedSeries(User, Series, session.user.id, seriesId, serieData, {
      status,
      isFavorite,
      rating,
      markAllWatched,
    });
    return NextResponse.json({ success: true, trackedSeries }, { status: 200 });
  } catch (err) {
    console.error("POST /api/series/tracked error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

// Récupérer les séries suivies
export const GET = async (request) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const trackedSeries = await getTrackedSeries(User, session.user.id);
    return NextResponse.json({ trackedSeries }, { status: 200 });
  } catch (err) {
    console.error("GET /api/series/tracked error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

// Retirer une série du suivi
export const DELETE = async (request) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { serieId } = await request.json();
    const trackedSeries = await removeTrackedSeries(User, session.user.id, serieId);
    return NextResponse.json({ success: true, trackedSeries }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
