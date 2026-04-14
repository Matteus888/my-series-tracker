import mongoose from "mongoose";

const episodeProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required."],
    },
    episodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Episode",
      required: [true, "Episode ID is required."],
    },
    watched: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      min: [1, "Minimum note is 1."],
      max: [10, "Maximum note is 10."],
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Index pour optimiser les requêtes
episodeProgressSchema.index({ userId: 1, episodeId: 1 }, { unique: true });

export const EpisodeProgress =
  mongoose.models.EpisodeProgress || mongoose.model("EpisodeProgress", episodeProgressSchema);
