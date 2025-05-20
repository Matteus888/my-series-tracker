import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name?: string;
  image?: string;
  passwordHash?: string;
  watchlist: mongoose.Types.ObjectId[];
  favorites: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: String,
    image: String,
    passwordHash: String,
    watchlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Series",
      },
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Series",
      },
    ],
  },
  { timestamps: true }
);

const User = models.User || model<IUser>("User", userSchema);

export default User;
