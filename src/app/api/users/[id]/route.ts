import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/user.model";
import { userUpdateSchema } from "@/lib/validation/user.schema";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

interface Params {
  params: { id: string };
}

// Validation ObjectId
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/users/:id - Récupérer un utilisateur
export async function GET({ params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.id !== params.id) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  if (!isValidObjectId(params.id)) {
    return NextResponse.json({ message: "ID utilisateur invalide." }, { status: 400 });
  }

  try {
    await connectToDB();
    const user = await User.findById(params.id).select("-__v -password");
    if (!user) {
      return NextResponse.json({ message: "Utilisateur non trouvé." }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Erreur lors de la récupération de l'utilisateur :", error }, { status: 500 });
  }
}

// PUT /api/users/:id - Mise à jour d'un utilisateur
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.id !== params.id) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  if (!isValidObjectId(params.id)) {
    return NextResponse.json({ message: "ID utilisateur invalide." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const parsed = userUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Données invalides", errors: parsed.error.format() });
    }

    await connectToDB();

    const updatedUser = await User.findByIdAndUpdate(params.id, parsed.data, { new: true }).select("-__v -password");
    if (!updatedUser) {
      return NextResponse.json({ message: "Utilisateur non trouvé." }, { status: 404 });
    }
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Erreur lors de la mise à jour d'un utilisateur :", error }, { status: 500 });
  }
}

// DELETE /api/users/:id - Suppression d'un utilisateur
export async function DELETE({ params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.id !== params.id) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  if (!isValidObjectId(params.id)) {
    return NextResponse.json({ message: "ID utilisateur invalide." }, { status: 400 });
  }

  try {
    await connectToDB();
    const deletedUser = await User.findByIdAndDelete(params.id);
    if (!deletedUser) {
      return NextResponse.json({ message: "Utilisateur non trouvé." }, { status: 404 });
    }
    return NextResponse.json({ message: "Utilisateur supprimé." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Erreur lors de la suppression de l'utilisateur :", error }, { status: 500 });
  }
}
