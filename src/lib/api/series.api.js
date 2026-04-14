import { Series } from "@/models/series.model";
import { Episode } from "@/models/episode.model";
import { UserList } from "@/models/userList.model";
import { EpisodeProgress } from "@/models/episodeProgress.model";
import { getAllSeasonsWithEpisodes } from "./tmdb.api";
import { getOmdbRatings } from "./omdb.api";
import { upsertEpisodes } from "@/lib/db/upsertEpisodes";

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

  const imdbId = seriesDetails.external_ids?.imdb_id || null;
  const omdbRatings = imdbId ? await getOmdbRatings(imdbId) : null;

  const series = await SeriesModel.findOneAndUpdate(
    { tmdbId },
    {
      $set: {
        tmdbId,
        title: serieData.name,
        posterPath: serieData.poster_path,
        backdropPath: serieData.backdrop_path,
        overview: serieData.overview,
        genres: seriesDetails.genres?.map((g) => g.name) || [],
        firstAirDate: serieData.first_air_date ? new Date(serieData.first_air_date) : null,
        numberOfSeasons: seriesDetails.number_of_seasons,
        numberOfEpisodes: seriesDetails.number_of_episodes,
        seasons: seasonsData,
        imdbId,
        "ratings.tmdb.score": serieData.vote_average,
        "ratings.tmdb.voteCount": serieData.vote_count,
        "ratings.imdb.score": omdbRatings?.imdb?.score || null,
        "ratings.imdb.voteCount": omdbRatings?.imdb?.voteCount || null,
        "ratings.lastFetched": new Date(),
      },
    },
    { upsert: true, returnDocument: "after", runValidators: true },
  );

  const episodeIdMap = await upsertEpisodes(series._id, Number(tmdbId), seasons);

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
    const progressDocs = seasons.flatMap((season) =>
      season.episodes
        .map((ep) => {
          const episodeId = episodeIdMap.get(ep.id) ?? episodeIdMap.get(`${season.season_number}-${ep.episode_number}`);

          if (!episodeId) return null;

          return {
            userId,
            episodeId,
            watched: true,
            watchedAt: new Date(),
          };
        })
        .filter(Boolean),
    );

    if (progressDocs.length > 0) {
      await EpisodeProgress.insertMany(progressDocs, { ordered: false }).catch((err) => {
        if (err.code !== 11000) throw err;
      });
    }

    const watchlist = await UserList.findOne({ userId, isDefault: true });
    if (watchlist) {
      await UserList.findByIdAndUpdate(watchlist._id, {
        $pull: { series: series._id },
      });
    }
  }

  return user.trackedSeries;
};

export const getTrackedSeries = async (UserModel, userId) => {
  await dbConnect();
  const user = await UserModel.findById(userId).populate({
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

  const trackedEntry = user.trackedSeries.find((s) => s.tmdbId?.toString() === tmdbId.toString());

  user.trackedSeries = user.trackedSeries.filter((s) => s.tmdbId?.toString() !== tmdbId.toString());

  await user.save();

  if (trackedEntry?.seriesId) {
    const episodeIds = await Episode.find({ seriesId: trackedEntry.seriesId })
      .select("_id")
      .lean()
      .then((docs) => docs.map((d) => d._id));

    if (episodeIds.length > 0) {
      await EpisodeProgress.deleteMany({ userId, episodeId: { $in: episodeIds } });
    }
  }

  return user.trackedSeries;
};

export const updateTrackedSeries = async (UserModel, userId, tmdbId, updates) => {
  await dbConnect();
  const user = await UserModel.findById(userId);
  if (!user) throw new Error("User not found");

  const existingSerieIndex = user.trackedSeries.findIndex((s) => s.tmdbId?.toString() === tmdbId.toString());
  if (existingSerieIndex === -1) throw new Error("Serie not tracked");

  const allowedFields = ["isFavorite", "status", "rating"];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      user.trackedSeries[existingSerieIndex][field] = updates[field];
    }
  });
  await user.save();
  return user.trackedSeries;
};

export const getEpisodeProgressForSeries = async (userId, seriesId) => {
  await dbConnect();

  const episodes = await Episode.find({ seriesId }).sort({ seasonNumber: 1, episodeNumber: 1 }).lean();

  if (episodes.length === 0) return [];

  const episodeIds = episodes.map((e) => e._id);

  const progressList = await EpisodeProgress.find({
    userId,
    episodeId: { $in: episodeIds },
  })
    .select("episodeId watched watchedAt rating")
    .lean();

  const progressMap = new Map(progressList.map((p) => [p.episodeId.toString(), p]));

  return episodes.map((ep) => {
    const progress = progressMap.get(ep._id.toString());
    return {
      ...ep,
      watched: progress?.watched ?? false,
      watchedAt: progress?.watchedAt ?? null,
      rating: progress?.rating ?? null,
    };
  });
};
