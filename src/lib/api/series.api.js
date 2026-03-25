import { Series } from "@/models/series.model"; // nécessaire pour l'enregistrement du schéma Mongoose
import { EpisodeProgress } from "@/models/episodeProgress.model";
import { getAllSeasonsWithEpisodes } from "./tmdb.api";
const dbConnect = require("@/lib/db/db.connect").default;

export const addTrackedSeries = async (UserModel, SeriesModel, userId, tmdbId, serieData, options = {}) => {
  await dbConnect();

  const { seriesDetails, seasons } = await getAllSeasonsWithEpisodes(tmdbId);

  const seasonsData = seasons.map((season) => ({
    seasonNumber: season.season_number,
    episodeCount: season.episodes.length,
    tmdbSeasonId: season.id,
    name: season.name,
    posterPath: season.poster_path,
    airDate: season.air_date ? new Date(season.air_date) : null,
  }));

  const series = await SeriesModel.findOneAndUpdate(
    { tmdbId },
    {
      tmdbId,
      title: serieData.name,
      posterPath: serieData.poster_path,
      backdropPath: serieData.backdrop_path,
      overview: serieData.overview,
      firstAirDate: serieData.first_air_date ? new Date(serieData.first_air_date) : null,
      voteAverage: serieData.vote_average,
      voteCount: serieData.vote_count,
      numberOfSeasons: seriesDetails.number_of_seasons,
      numberOfEpisodes: seriesDetails.number_of_episodes,
      seasons: seasonsData,
      lastUpdated: new Date(),
    },
    { upsert: true, returnDocument: "after", runValidators: true },
  );

  const user = await UserModel.findById(userId);
  if (!user) throw new Error("User not found");

  const existingSeriesIndex = user.trackedSeries.findIndex((s) => s.tmdbId?.toString() === tmdbId.toString());
  if (existingSeriesIndex >= 0) {
    Object.assign(user.trackedSeries[existingSeriesIndex], options);
  } else {
    user.trackedSeries.push({
      seriesId: series._id,
      tmdbId: Number(tmdbId),
      status: options.status || "plan_to_watch",
      isFavorite: options.isFavorite || false,
      rating: options.rating || null,
    });
  }

  await user.save();

  if (options.markAllWatched) {
    const episodeDocs = seasons.flatMap((season) =>
      season.episodes.map((episode) => ({
        userId,
        seriesId: series._id,
        seasonNumber: season.season_number,
        episodeNumber: episode.episode_number,
        tmdbEpisodeId: episode.id,
        watched: true,
        watchedAt: new Date(),
      })),
    );

    await EpisodeProgress.insertMany(episodeDocs, { ordered: false }).catch((err) => {
      if (err.code !== 11000) throw err;
    });
  }

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

  const trackedEntry = user.trackedSeries.find((s) => s.tmdbId === tmdbId);

  user.trackedSeries = user.trackedSeries.filter((s) => s.tmdbId !== tmdbId);

  await user.save();

  if (trackedEntry) {
    await EpisodeProgress.deleteMany({
      userId,
      seriesId: trackedEntry.seriesId,
    });
  }

  return user.trackedSeries;
};
