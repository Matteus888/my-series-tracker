import mongoose from "mongoose";

const seriesSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
      required: [true, "TMDB ID is required."],
      unique: true,
    },
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
    },
    originalTitle: {
      type: String,
      trim: true,
    },
    overview: {
      type: String,
      trim: true,
      maxlength: [1000, "Overview must not exceed 1000 characters."],
    },
    tagline: {
      type: String,
      trim: true,
    },
    posterPath: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return value ? value.startsWith("/") : true;
        },
        message: "Poster path must be valid.",
      },
    },
    backdropPath: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return value ? value.startsWith("/") : true;
        },
        message: "Backdrop path must be valid.",
      },
    },
    firstAirDate: {
      type: Date,
    },
    lastAirDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ["Returning Series", " Planned", "In Production", "Ended", "Canceled", "Pilot"],
        message: "Serie status is invalid.",
      },
    },
    genres: [
      {
        type: String,
        trim: true,
      },
    ],
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
      rottenTomatoes: {
        score: { type: Number, min: 0, max: 100 },
      },
      metacritic: {
        score: { type: Number, min: 0, max: 100 },
      },
      trakt: {
        score: { type: Number, min: 0, max: 10 },
        voteCount: { type: Number, default: 0 },
      },
      lastFetched: {
        type: Date,
      },
    },
    imdbId: {
      type: String,
      trim: true,
    },
    numberOfSeasons: {
      type: Number,
      default: 1,
      min: [1, "Number of seasons must be at least 1."],
    },
    numberOfEpisodes: {
      type: Number,
      default: 1,
      min: [1, "Number of episodes must be at least 1."],
    },
    seasons: [
      {
        seasonNumber: { type: Number, required: true },
        episodeCount: { type: Number, required: true },
        tmdbSeasonId: { type: Number },
        name: { type: String, trim: true },
        posterPath: {
          type: String,
          trim: true,
        },
        airDate: { type: Date },
      },
    ],
    networks: [
      {
        id: { type: Number },
        name: { type: String, trim: true },
        logoPath: { type: String, trim: true },
        homepage: { type: String, trim: true },
      },
    ],
    cast: [
      {
        tmdbId: { type: Number, required: true },
        name: { type: String, trim: true },
        character: { type: String, trim: true },
        profilePath: { type: String, trim: true },
        order: { type: Number },
      },
    ],
    createdBy: [
      {
        tmdbId: { type: Number, required: true },
        name: { type: String, trim: true },
        profilePath: { type: String, trim: true },
      },
    ],
    isPopular: {
      type: Boolean,
      default: false, // Peut être mis à jour via un cron job (ex: séries les plus suivies)
    },
    tmdbUrl: {
      type: String,
      trim: true,
    },
    releaseTimeOverride: {
      dayOffset: { type: Number, min: 0, max: 1 },
      hourUTC: { type: Number, min: 0, max: 23 },
    },
    episodeNumberOffset: {
      type: Number,
      default: 0, // ex: -1 si TMDB compte 1 épisode de trop
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Construction de l'URL complète des images via TMDB
seriesSchema.methods.getPosterUrl = function (size = "w500") {
  return this.posterPath ? `https://image.tmdb.org/t/p/${size}${this.posterPath}` : null;
};

seriesSchema.methods.getBackdropUrl = function (size = "w1280") {
  return this.backdropPath ? `https://image.tmdb.org/t/p/${size}${this.backdropPath}` : null;
};

export const Series = mongoose.models.Series || mongoose.model("Series", seriesSchema);
