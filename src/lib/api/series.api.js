import { Series } from "@/models/series.model";
const dbConnect = require("@/lib/db/db.connect").default;

export const addTrackedSeries = async (UserModel, SeriesModel, userId, tmdbId, serieData, options = {}) => {
  await dbConnect();
  const series = await SeriesModel.findOneAndUpdate(
    { tmdbId },
    {
      tmdbId,
      title: serieData.name,
      posterPath: serieData.poster_path,
      backdropPath: serieData.backdrop_path,
      overview: serieData.overview,
      firstAirDate: serieData.first_air_date,
      voteAverage: serieData.vote_average,
      voteCount: serieData.vote_count,
    },
    { upsert: true, returnDocument: "after", runValidators: true },
  );
  const user = await UserModel.findById(userId);
  if (!user) throw new Error("User not found");

  const existingSeriesIndex = user.trackedSeries.findIndex((s) => s.seriesId.toString() === series._id.toString());
  if (existingSeriesIndex >= 0) {
    user.trackedSeries[existingSeriesIndex] = { ...user.trackedSeries[existingSeriesIndex].toObject(), ...options };
  } else {
    user.trackedSeries.push({
      seriesId: series._id,
      tmdbId: tmdbId,
      status: options.status || "plan_to_watch",
      lastWatched: options.lastWatched || { season: 1, episode: 1 },
      isFavorite: options.isFavorite || false,
      rating: options.rating || null,
    });
  }

  await user.save();
  return user.trackedSeries;
};

export const getTrackedSeries = async (UserModel, userId) => {
  await dbConnect();
  const userQuery = UserModel.findById(userId);
  const user = await userQuery.populate({
    path: "trackedSeries.seriesId",
    model: "Series",
  });
  if (!user) throw new Error("User not found");

  return user.trackedSeries;
};

export const removeTrackedSeries = async (UserModel, userId, tmdbId) => {
  await dbConnect();
  const user = await UserModel.findById(userId);
  if (!user) throw new Error("User not found");

  user.trackedSeries = user.trackedSeries.filter((s) => s.tmdbId !== tmdbId);

  console.log("trackedSeries après:", user.trackedSeries.length);

  await user.save();
  return user.trackedSeries;
};
