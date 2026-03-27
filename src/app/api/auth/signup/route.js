import { NextResponse } from "next/server";
import { User } from "@/models/user.model";
import dbConnect from "@/lib/db/db.connect";
import bcrypt from "bcryptjs";
import { UserList } from "@/models/userList.model";

export async function POST(request) {
  try {
    await dbConnect();

    const { username, email, password } = await request.json();
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email and password are required." }, { status: 400 });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email or username already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    await UserList.create({
      userId: user._id,
      name: "Watchlist",
      description: "Series I plan to watch",
      isDefault: true,
      isPublic: false,
      series: [],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account successfully created!",
        user: {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error during registration:", err);
    return NextResponse.json({ error: "An error occurred during registration." }, { status: 500 });
  }
}
