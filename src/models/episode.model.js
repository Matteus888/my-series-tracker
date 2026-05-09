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
    ratings: {
      tmdb: {
        score: {
          type: Number,
          min: [0, "Score cannot be less than 0."],
          max: [10, "Score cannot be greater than 10."],
        },
        voteCount: {
          type: Number,
          default: 0,
        },
      },
      trakt: {
        score: { type: Number, min: 0, max: 10 },
        voteCount: { type: Number, default: 0 },
        fetchedAt: { type: Date },
      },
      imdb: {
        score: {
          type: Number,
          min: [0, "Score cannot be less than 0."],
          max: [10, "Score cannot be greater than 10."],
        },
        voteCount: {
          type: Number,
          default: 0,
        },
      },
      lastFetched: {
        type: Date,
      },
    },
    cast: [
      {
        tmdbId: { type: Number, required: true },
        name: { type: String, trim: true },
        character: { type: String, trim: true },
        profilePath: { type: String, trim: true },
        order: { type: Number },
        isGuest: { type: Boolean, default: false },
        _id: false,
      },
    ],
    crew: [
      {
        tmdbId: { type: Number, required: true },
        name: { type: String, trim: true },
        job: { type: String, trim: true },
        department: { type: String, trim: true },
        profilePath: { type: String, trim: true },
      },
    ],
    videos: [
      {
        key: { type: String, required: true },
        name: { type: String, trim: true },
        type: { type: String, trim: true },
        publishedAt: { type: Date },
      },
    ],
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    imdbId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

episodeSchema.index({ seriesId: 1, seasonNumber: 1, episodeNumber: 1 }, { unique: true });
episodeSchema.index({ tmdbSeriesId: 1, seasonNumber: 1 }); // pour le calendrier

export const Episode = mongoose.models.Episode || mongoose.model("Episode", episodeSchema);
