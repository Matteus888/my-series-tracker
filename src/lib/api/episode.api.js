import { Episode } from "@/models/episode.model";
import { UserList } from "@/models/userList.model";
import { EpisodeProgress } from "@/models/episodeProgress.model";

const dbConnect = require("@/lib/db/db.connect").default;

export const getContinueWatching = async (UserModel, userId) => {
  await dbConnect();

  const user = await UserModel.findById(userId).populate({ path: "trackedSeries.seriesId", model: "Series" }).lean();
  if (!user) throw new Error("User not found");

  const watchingSeries = user.trackedSeries.filter((t) => t.seriesId && t.status !== "dropped");
  if (watchingSeries.length === 0) return [];

  const results = await Promise.all(
    watchingSeries.map(async (tracked) => {
      const seriesId = tracked.seriesId._id;

      const allEpisodes = await Episode.find({ seriesId })
        .sort({ seasonNumber: 1, episodeNumber: 1 })
        .select("_id seasonNumber episodeNumber title airDate")
        .lean();
      if (allEpisodes.length === 0) return null;

      const episodeIds = allEpisodes.map((e) => e._id);

      const progressList = await EpisodeProgress.find({
        userId,
        episodeId: { $in: episodeIds },
        watched: true,
      })
        .select("episodeId watchedAt")
        .lean();

      const watchedIds = new Set(progressList.map((p) => p.episodeId.toString()));
      if (watchedIds.size === 0) return null;
      if (watchedIds.size === allEpisodes.length) return null;

      const now = new Date();

      const nextEpisode = allEpisodes.find((e) => !watchedIds.has(e._id.toString()) && e.airDate && e.airDate <= now);
      if (!nextEpisode) return null;

      const lastWatchedAt = progressList.reduce(
        (latest, p) => (!latest || p.watchedAt > latest ? p.watchedAt : latest),
        null,
      );

      const series = tracked.seriesId;

      const seasonData = series.seasons?.find((s) => s.seasonNumber === nextEpisode.seasonNumber);

      return {
        seriesId: seriesId.toString(),
        tmdbId: tracked.tmdbId,
        title: series.title,
        posterPath: seasonData?.posterPath ?? series.posterPath ?? null,
        watchedCount: watchedIds.size,
        totalCount: allEpisodes.length,
        lastWatchedAt,
        nextEpisode: {
          _id: nextEpisode._id.toString(),
          seasonNumber: nextEpisode.seasonNumber,
          episodeNumber: nextEpisode.episodeNumber,
          title: nextEpisode.title ?? null,
          airDate: nextEpisode.airDate ?? null,
        },
      };
    }),
  );

  return results.filter(Boolean).sort((a, b) => new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt));
};

export const markEpisodeWatched = async (EpisodeModel, userId, episodeId, watched = true) => {
  await dbConnect();

  const episode = await EpisodeModel.findById(episodeId).lean();
  if (!episode) throw new Error("Episode not found");

  if (watched) {
    await EpisodeProgress.findOneAndUpdate(
      { userId, episodeId },
      { $set: { watched: true, watchedAt: new Date() } },
      { upsert: true, runValidators: true },
    );
  } else {
    await EpisodeProgress.findOneAndDelete({ userId, episodeId });
  }

  return { watched };
};

export const getStartWatching = async (UserModel, userId) => {
  await dbConnect();

  const user = await UserModel.findById(userId)
    .populate({
      path: "trackedSeries.seriesId",
      model: "Series",
    })
    .lean();

  if (!user) throw new Error("User not found");

  // Récupère la watchlist par défaut
  const watchlist = await UserList.findOne({ userId, isDefault: true })
    .populate({ path: "series", model: "Series" })
    .lean();
  if (!watchlist || watchlist.series.length === 0) return [];

  const now = new Date();

  const results = await Promise.all(
    watchlist.series.map(async (series) => {
      // Premier épisode diffusé
      const firstEpisode = await Episode.findOne({
        seriesId: series._id,
        airDate: { $lte: now },
      })
        .sort({ seasonNumber: 1, episodeNumber: 1 })
        .select("_id seasonNumber episodeNumber title airDate")
        .lean();
      if (!firstEpisode) return null;

      const seasonData = series.seasons?.find((s) => s.seasonNumber === firstEpisode.seasonNumber);

      return {
        seriesId: series._id.toString(),
        tmdbId: series.tmdbId,
        title: series.title,
        posterPath: seasonData?.posterPath ?? series.posterPath ?? null,
        firstEpisode: {
          _id: firstEpisode._id.toString(),
          seasonNumber: firstEpisode.seasonNumber,
          episodeNumber: firstEpisode.episodeNumber,
        },
      };
    }),
  );

  return results.filter(Boolean);
};
