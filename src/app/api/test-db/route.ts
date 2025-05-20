import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectToDB();
    return NextResponse.json({ message: "✅ Connexion MongoDB réussi" }, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur de connexion :", error);
    return NextResponse.json({ error: "Erreur de connexion à MongoDB" }, { status: 500 });
  }
}
