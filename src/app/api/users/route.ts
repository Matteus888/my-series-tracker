import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/user.model";
import { userRegistrationSchema, userSchema } from "@/lib/validation/user.schema";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET /api/users - Liste tous les utilisateurs
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    await connectToDB();
    const users = await User.find().select("-__v -password");
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Erreur lors de la récupération des utilisateurs :", error }, { status: 500 });
  }
}

// POST /api/users - Créer un nouvel utilisateur
export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    const body = await request.json();

    // Validation stricte, on veut passwordHash
    const parsed = userRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Données invalides", errors: parsed.error.format() }, { status: 400 });
    }

    const validData = parsed.data;

    const existingUser = await User.findOne({ email: validData.email });
    if (existingUser) {
      return NextResponse.json({ message: "Utilisateur déjà existant." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(validData.passwordHash, 10);

    const newUser = new User({
      email: validData.email,
      name: validData.name,
      image: validData.image,
      passwordHash: hashedPassword,
      watchlist: validData.watchlist || [],
      favorites: validData.favorites || [],
    });

    await newUser.save();

    // On supprime passwordHash dans la réponse
    const userResponse = newUser.toObject();
    delete userResponse.passwordHash;

    // Validation de la réponse
    const responseParsed = userSchema.safeParse(userResponse);
    if (!responseParsed.success) {
      return NextResponse.json({ message: "Erreur inattendue lors de la validation des données utilisateur." }, { status: 500 });
    }

    return NextResponse.json(responseParsed, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Erreur lors de la création de l'utilisateur :", error }, { status: 500 });
  }
}
