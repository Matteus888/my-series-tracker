import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IEpisodeProgress extends Document {
  user: mongoose.Types.ObjectId;
  series: mongoose.Types.ObjectId;
  seasonNumber: number;
  episodeNumber: number;
  watchedAt?: Date;
}

const episodeProgressSchema = new Schema<IEpisodeProgress>(
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
    seasonNumber: {
      type: Number,
      required: true,
    },
    episodeNumber: {
      type: Number,
      required: true,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const EpisodeProgress = models.EpisodeProgress || model<IEpisodeProgress>("EpisodeProgress", episodeProgressSchema);

export default EpisodeProgress;
