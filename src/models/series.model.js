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
    voteAverage: {
      type: Number,
      min: [0, "Vote average cannot be less than 0."],
      max: [10, "Vote average cannot be greater than 10."],
    },
    voteCount: {
      type: Number,
      default: 0,
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
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    isPopular: {
      type: Boolean,
      default: false, // Peut être mis à jour via un cron job (ex: séries les plus suivies)
    },
    tmdbUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Construction de l'URL complète des images via TMDB
seriesSchema.methods.getPosterUrl = function (size = "w500") {
  return this.posterPath ? `htpps://image.tmdb.org/t/p/${size}${this.posterPath}` : null;
};

seriesSchema.methods.getBackdropUrl = function (size = "w1280") {
  return this.backdropPath ? `https://image.tmdb.org/t/p/${size}${this.backdropPath}` : null;
};

export const Series = mongoose.models.Series || mongoose.model("Series", seriesSchema);
