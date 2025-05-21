import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Series from "@/models/series.model";

// GET /series - Liste toutes les séries
export async function GET() {
  try {
    await connectToDB();

    const seriesList = await Series.find().select("-__v").sort({ createdAt: -1 });

    return NextResponse.json(seriesList, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des séries :", error);
    return NextResponse.json({ message: "Erreur serveur lors de la récupération des séries." }, { status: 500 });
  }
}
