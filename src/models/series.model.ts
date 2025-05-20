import { Schema, model, models, Document } from "mongoose";

export interface ISeries extends Document {
  tmdbId: number;
  title: string;
  overview?: string;
  posterPath?: string;
  genres?: string[];
  releaseDate?: string;
  numberOfSeasons?: number;
  status?: "Returning Series" | "Ended" | "Canceled" | "In Production" | "Planned";
  createdAt?: Date;
  updatedAt?: Date;
}

const seriesSchema = new Schema<ISeries>(
  {
    tmdbId: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    overview: String,
    posterPath: String,
    genres: [String],
    releaseDate: String,
    numberOfSeasons: Number,
    status: {
      type: String,
      enum: ["Returning Series", "Ended", "Canceled", "In Production", "Planned"],
    },
  },
  {
    timestamps: true,
  }
);

const Series = models.Series || model<ISeries>("Series", seriesSchema);

export default Series;
