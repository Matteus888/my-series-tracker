import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId;
  series: mongoose.Types.ObjectId;
  addedAt?: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    series: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Series",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Favorite = models.Favorite || model<IFavorite>("Favorite", favoriteSchema);

export default Favorite;
