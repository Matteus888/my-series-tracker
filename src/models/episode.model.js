import mongoose from "mongoose";

const episodeSchema = new mongoose.Schema(
  {
    seriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Series",
      required: [true, "Series ID is required."],
    },
    tmdbSeriesId: {
      type: Number,
      required: true,
    },
    tmdbEpisodeId: {
      type: Number,
      unique: true,
      sparse: true, // certains épisodes n'ont pas d'id TMDB
    },
    seasonNumber: {
      type: Number,
      required: true,
      min: [1, "Season number must be at least 1."],
    },
    episodeNumber: {
      type: Number,
      required: true,
      min: [1, "Episode number must be at least 1."],
    },
    title: {
      type: String,
      trim: true,
    },
    overview: {
      type: String,
      trim: true,
      maxlength: [500, "Overview must not exceed 500 characters."],
    },
    stillPath: {
      type: String,
      trim: true,
    },
    airDate: {
      type: Date,
    },
    duration: {
      type: Number, // en minutes
    },
  },
  {
    timestamps: true,
  },
);

episodeSchema.index({ seriesId: 1, seasonNumber: 1, episodeNumber: 1 }, { unique: true });
episodeSchema.index({ tmdbSeriesId: 1, seasonNumber: 1 }); // pour le calendrier

export const Episode = mongoose.models.Episode || mongoose.model("Episode", episodeSchema);
