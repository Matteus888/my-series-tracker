import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IWatchlistItem extends Document {
  user: mongoose.Types.ObjectId;
  series: mongoose.Types.ObjectId;
  addedAt?: Date;
  status?: "To Watch" | "Watching" | "Completed";
}

const watchlistItemSchema = new Schema<IWatchlistItem>(
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
    status: {
      type: String,
      enum: ["To Watch", "Watching", "Completed"],
      default: "To Watch",
    },
  },
  {
    timestamps: true,
  }
);

const WatchlistItem = models.WatchlistItem || model<IWatchlistItem>("WatchlistItem", watchlistItemSchema);

export default WatchlistItem;
