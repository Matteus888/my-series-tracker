import mongoose from "mongoose";

const episodeProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required."],
    },
    seriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Series",
      required: [true, "Serie ID is required."],
    },
    seasonNumber: {
      type: Number,
      required: [true, "Season number is required."],
      min: [1, "Season number must be at least 1."],
    },
    episodeNumber: {
      type: Number,
      required: [true, "Episode number is required."],
      min: [1, "Episode number must be at least 1."],
    },
    watched: {
      type: Boolean,
      default: false,
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
    tmdbEpisodeId: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour optimiser les requêtes
episodeProgressSchema.index({ userId: 1, seriesId: 1, seasonNumber: 1, episodeNumber: 1 });

export const EpisodeProgress =
  mongoose.models.EpisodeProgress || mongoose.model("EpisodeProgress", episodeProgressSchema);
