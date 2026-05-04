import { Episode } from "@/models/episode.model";
import { Series } from "@/models/series.model";
import { UserList } from "@/models/userList.model";
import { EpisodeProgress } from "@/models/episodeProgress.model";
import { User } from "@/models/user.model";

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
        .select("_id seasonNumber episodeNumber title airDate duration")
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

      const remainingEpisodes = allEpisodes.filter(
        (e) => !watchedIds.has(e._id.toString()) && e.airDate && e.airDate <= now,
      );

      const remainingCount = remainingEpisodes.length;
      const totalRemainingDuration = remainingEpisodes.reduce((sum, e) => sum + (e.duration ?? 0), 0);

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
        remainingCount,
        totalRemainingDuration,
        nextEpisode: {
          _id: nextEpisode._id.toString(),
          seasonNumber: nextEpisode.seasonNumber,
          episodeNumber: nextEpisode.episodeNumber,
          title: nextEpisode.title ?? null,
          airDate: nextEpisode.airDate ?? null,
          duration: nextEpisode.duration ?? null,
          seasonEpisodeCount: seasonData?.episodeCount ?? null,
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

    const now = new Date();
    const allEpisodes = await Episode.find({
      seriesId: episode.seriesId,
      airDate: { $lte: now },
    })
      .select("_id")
      .lean();

    const watchedCount = await EpisodeProgress.countDocuments({
      userId,
      episodeId: { $in: allEpisodes.map((e) => e._id) },
      watched: true,
    });

    if (watchedCount === allEpisodes.length) {
      const user = await User.findById(userId);
      if (user) {
        const trackedEntry = user.trackedSeries.find((s) => s.seriesId?.toString() === episode.seriesId.toString());
        if (trackedEntry && trackedEntry.status === "watching") {
          trackedEntry.status = "completed";
          await user.save();
        }
      }
    }
  } else {
    await EpisodeProgress.findOneAndDelete({ userId, episodeId });

    // Vérifie s'il reste des épisodes vus pour cette série
    const allEpisodeIds = await Episode.find({ seriesId: episode.seriesId })
      .select("_id")
      .lean()
      .then((docs) => docs.map((d) => d._id));

    const remainingWatched = await EpisodeProgress.countDocuments({
      userId,
      episodeId: { $in: allEpisodeIds },
      watched: true,
    });

    const user = await User.findById(userId);
    if (user) {
      const trackedEntry = user.trackedSeries.find((s) => s.seriesId?.toString() === episode.seriesId.toString());
      if (trackedEntry) {
        if (remainingWatched === 0) {
          // Plus aucun épisode vu → dé-tracke complètement
          user.trackedSeries = user.trackedSeries.filter((s) => s.seriesId?.toString() !== episode.seriesId.toString());
        } else if (trackedEntry.status === "completed") {
          // Repassé à watching
          trackedEntry.status = "watching";
        }
        await user.save();
      }
    }
  }

  return { watched };
};

export const getStartWatching = async (UserModel, userId) => {
  await dbConnect();

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

export const getRecentlyWatchedFlat = async (userId) => {
  await dbConnect();
  const items = await _fetchWatchedEpisodes(userId);
  return items.slice(0, 10).map((item) => ({
    ...item,
    watchedAt: item.watchedAt ? item.watchedAt.toISOString() : null,
  }));
};

export const getRecentlyWatched = async (userId) => {
  await dbConnect();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const items = await _fetchWatchedEpisodes(userId, thirtyDaysAgo);

  // Convertit watchedAt en string et groupe par jour
  const grouped = {};
  for (const item of items) {
    const watchedAtStr = item.watchedAt ? item.watchedAt.toISOString() : null;
    if (!watchedAtStr) continue;
    const dateKey = watchedAtStr.slice(0, 10);
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push({ ...item, watchedAt: watchedAtStr });
  }

  return Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, episodes]) => ({ date, episodes }));
};

export const getCalendar = async (UserModel, userId) => {
  await dbConnect();

  const user = await UserModel.findById(userId).populate({ path: "trackedSeries.seriesId", model: "Series" }).lean();
  if (!user) throw new Error("User not found");

  const watchingSeries = user.trackedSeries.filter((t) => t.seriesId && t.status !== "dropped");
  const watchlist = await UserList.findOne({ userId, isDefault: true })
    .populate({ path: "series", model: "Series" })
    .lean();
  const watchlistSeries = watchlist?.series ?? [];

  if (watchingSeries.length === 0 && watchlistSeries.length === 0) return [];

  // const now = new Date();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Map seriesId: données série pour lookup rapide (dédoublonnage automatique)
  const seriesMap = new Map();
  for (const t of watchingSeries) {
    seriesMap.set(t.seriesId._id.toString(), t.seriesId);
  }
  for (const s of watchlistSeries) {
    seriesMap.set(s._id.toString(), s);
  }

  const seriesIds = Array.from(seriesMap.values()).map((s) => s._id);

  // Récupère tous les épisodes futurs des séries en cours
  const upcomingEpisodes = await Episode.find({
    seriesId: { $in: seriesIds },
    airDate: { $gte: startOfToday },
  })
    .sort({ airDate: 1 })
    .select("_id seriesId seasonNumber episodeNumber title airDate overview duration ratings")
    .lean();
  if (upcomingEpisodes.length === 0) return [];

  // Groupe par date (YYYY-MM-DD)
  const grouped = {};
  for (const ep of upcomingEpisodes) {
    const series = seriesMap.get(ep.seriesId.toString());
    if (!series) continue;

    const dateKey = ep.airDate.toISOString().slice(0, 10);
    if (!grouped[dateKey]) grouped[dateKey] = [];

    // Poster de la saison
    const seasonData = series.seasons?.find((s) => s.seasonNumber === ep.seasonNumber);
    const posterPath = seasonData?.posterPath ?? series.posterPath ?? null;

    grouped[dateKey].push({
      episodeId: ep._id.toString(),
      seriesId: ep.seriesId.toString(),
      tmdbId: series.tmdbId,
      seriesTitle: series.title,
      seasonNumber: ep.seasonNumber,
      episodeNumber: ep.episodeNumber,
      title: ep.title ?? null,
      overview: ep.overview ?? null,
      duration: ep.duration ?? null,
      ratings: ep.ratings ?? null,
      posterPath,
      airDate: ep.airDate.toISOString(),
      networks: series.networks ?? [],
      seasonEpisodeCount: seasonData?.episodeCount ?? null,
    });
  }

  // Agrège les "drops" : >3 épisodes d'une même saison le même jour → 1 entrée season-batch
  const SEASON_BATCH_THRESHOLD = 3;
  const result = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, episodes]) => {
      // Compte les épisodes par (seriesId + seasonNumber)
      const bySeason = new Map();
      for (const ep of episodes) {
        const key = `${ep.seriesId}__${ep.seasonNumber}`;
        if (!bySeason.has(key)) bySeason.set(key, []);
        bySeason.get(key).push(ep);
      }

      const finalItems = [];
      for (const [, eps] of bySeason) {
        if (eps.length > SEASON_BATCH_THRESHOLD) {
          // On agrège — on prend le premier épisode comme "représentant"
          const first = eps[0];
          finalItems.push({
            type: "season-batch",
            batchKey: `${first.seriesId}-s${first.seasonNumber}-${date}`,
            seriesId: first.seriesId,
            tmdbId: first.tmdbId,
            seriesTitle: first.seriesTitle,
            seasonNumber: first.seasonNumber,
            episodeCount: eps.length,
            posterPath: first.posterPath,
            airDate: first.airDate,
            networks: first.networks,
          });
        } else {
          for (const ep of eps) {
            finalItems.push({ type: "episode", ...ep });
          }
        }
      }

      // Trie : épisodes par seasonNumber/episodeNumber, batch en premier dans le jour
      finalItems.sort((a, b) => {
        if (a.type !== b.type) return a.type === "season-batch" ? -1 : 1;
        if (a.seasonNumber !== b.seasonNumber) return a.seasonNumber - b.seasonNumber;
        return (a.episodeNumber ?? 0) - (b.episodeNumber ?? 0);
      });

      return { date, episodes: finalItems };
    });

  return result;
};

export const rateEpisode = async (userId, episodeId, rating) => {
  await dbConnect();

  const episode = await Episode.findById(episodeId).lean();
  if (!episode) throw new Error("Episode not found");

  const progress = await EpisodeProgress.findOne({ userId, episodeId, watched: true }).lean();
  if (!progress) throw new Error("Episode must be watched before rating");

  if (rating !== null && (typeof rating !== "number" || rating < 1 || rating > 10)) {
    throw new Error("Rating must be null or a number between 1 and 10");
  }

  const updated = await EpisodeProgress.findOneAndUpdate(
    { userId, episodeId },
    rating === null ? { $unset: { rating: "" } } : { $set: { rating } },
    { new: true, runValidators: true },
  ).lean();

  return { rating: updated.rating ?? null };
};

// Fonction privée partagée — fetch + join + tri
const _fetchWatchedEpisodes = async (userId, since = null) => {
  const query = { userId, watched: true };
  if (since) query.watchedAt = { $gte: since };

  const progressList = await EpisodeProgress.find(query).sort({ watchedAt: -1 }).limit(500).lean();

  if (progressList.length === 0) return [];

  const episodeIds = progressList.map((p) => p.episodeId);
  const episodes = await Episode.find({ _id: { $in: episodeIds } })
    .select("_id seriesId seasonNumber episodeNumber title stillPath airDate duration ratings")
    .lean();

  const seriesIds = [...new Set(episodes.map((e) => e.seriesId.toString()))];
  const seriesList = await Series.find({ _id: { $in: seriesIds } })
    .select("_id title tmdbId")
    .lean();

  const seriesMap = new Map(seriesList.map((s) => [s._id.toString(), s]));
  const episodeMap = new Map(episodes.map((e) => [e._id.toString(), e]));

  return progressList
    .map((p) => {
      const ep = episodeMap.get(p.episodeId.toString());
      if (!ep) return null;
      const series = seriesMap.get(ep.seriesId.toString());
      if (!series) return null;
      return {
        _id: ep._id.toString(),
        seriesId: ep.seriesId.toString(),
        tmdbId: series.tmdbId,
        seriesTitle: series.title,
        seasonNumber: ep.seasonNumber,
        episodeNumber: ep.episodeNumber,
        title: ep.title ?? null,
        stillPath: ep.stillPath ?? null,
        airDate: ep.airDate ? ep.airDate.toISOString() : null,
        duration: ep.duration ?? null,
        ratings: ep.ratings ?? null,
        rating: p.rating ?? null,
        watchedAt: p.watchedAt, // Date pour le tri
        watched: true,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const timeA = Math.floor(new Date(a.watchedAt) / 1000);
      const timeB = Math.floor(new Date(b.watchedAt) / 1000);
      const timeDiff = timeB - timeA;
      if (timeDiff !== 0) return timeDiff;
      if (a.seasonNumber !== b.seasonNumber) return b.seasonNumber - a.seasonNumber;
      return b.episodeNumber - a.episodeNumber;
    });
};
