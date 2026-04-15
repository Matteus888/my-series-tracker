import { Episode } from "@/models/episode.model";
import { EpisodeProgress } from "@/models/episodeProgress.model";

const dbConnect = require("@/lib/db/db.connect").default;

export const getContinueWatching = async (UserModel, userId) => {
  await dbConnect();

  const user = await UserModel.findById(userId).populate({ path: "trackedSeries.seriesId", model: "Series" }).lean();

  if (!user) throw new Error("User not found");

  const watchingSeries = user.trackedSeries.filter(
    (t) => t.seriesId && t.status !== "completed" && t.status !== "dropped",
  );
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

      const nextEpisode = allEpisodes.find((e) => !watchedIds.has(e._id.toString()));
      if (!nextEpisode) return null;

      const lastWatchedAt = progressList.reduce(
        (latest, p) => (!latest || p.watchedAt > latest ? p.watchedAt : latest),
        null,
      );

      const series = tracked.seriesId;

      return {
        seriesId: seriesId.toString(),
        tmdbId: tracked.tmdbId,
        title: series.title,
        posterPath: series.posterPath ?? null,
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
