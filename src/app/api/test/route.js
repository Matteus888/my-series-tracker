import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";

export async function GET() {
  try {
    const mongoose = await dbConnect();

    if (mongoose.connection.readyState === 1) {
      return NextResponse.json({
        success: true,
        message: "✅ Connected to my-series-tracker database successfully",
        dbName: mongoose.connection.db.databaseName,
      });
    } else {
      throw new Error(
        `MongoDB connection failed with state: ${mongoose.connection.readyState}`
      );
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
