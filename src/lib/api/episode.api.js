import { Episode } from "@/models/episode.model";
import { Series } from "@/models/series.model";
import { UserList } from "@/models/userList.model";
import { EpisodeProgress } from "@/models/episodeProgress.model";
import { User } from "@/models/user.model";
import { getEpisodeDetails } from "./tmdb.api";

const dbConnect = require("@/lib/db/db.connect").default;

export const getContinueWatching = async (UserModel, userId) => {
  await dbConnect();

  const user = await UserModel.findById(userId)
    .select("trackedSeries")
    .populate({
      path: "trackedSeries.seriesId",
      model: "Series",
      select: "tmdbId title seasons posterPath status",
    })
    .lean();
  if (!user) throw new Error("User not found");

  const watchingSeries = user.trackedSeries.filter((t) => t.seriesId && t.status !== "dropped");
  if (watchingSeries.length === 0) return [];

  const seriesIds = watchingSeries.map((t) => t.seriesId._id);
  const now = new Date();

  // ─── 1 SEULE requête pour tous les épisodes de toutes les séries suivies ───
  const allEpisodes = await Episode.find({ seriesId: { $in: seriesIds }, airDate: { $lte: now } })
    .sort({ seasonNumber: 1, episodeNumber: 1 })
    .select("_id seriesId seasonNumber episodeNumber title airDate duration")
    .lean();

  // Groupe les épisodes par seriesId (en mémoire, ultra-rapide)
  const episodesBySeries = new Map();
  for (const ep of allEpisodes) {
    const key = ep.seriesId.toString();
    if (!episodesBySeries.has(key)) episodesBySeries.set(key, []);
    episodesBySeries.get(key).push(ep);
  }

  // ─── 1 SEULE requête pour tous les progress de tous les épisodes ───
  const allEpisodeIds = allEpisodes.map((e) => e._id);
  const allProgress = await EpisodeProgress.find({
    userId,
    episodeId: { $in: allEpisodeIds },
    watched: true,
  })
    .select("episodeId watchedAt")
    .lean();

  // Groupe les progress par seriesId (via lookup épisode → série)
  const episodeIdToSeriesId = new Map(allEpisodes.map((e) => [e._id.toString(), e.seriesId.toString()]));
  const progressBySeries = new Map();
  for (const p of allProgress) {
    const seriesKey = episodeIdToSeriesId.get(p.episodeId.toString());
    if (!seriesKey) continue;
    if (!progressBySeries.has(seriesKey)) progressBySeries.set(seriesKey, []);
    progressBySeries.get(seriesKey).push(p);
  }

  // ─── Construction des résultats en mémoire (synchrone, instantané) ───
  const results = watchingSeries
    .map((tracked) => {
      const seriesIdStr = tracked.seriesId._id.toString();
      const episodes = episodesBySeries.get(seriesIdStr) ?? [];
      if (episodes.length === 0) return null;

      const progressList = progressBySeries.get(seriesIdStr) ?? [];
      const watchedIds = new Set(progressList.map((p) => p.episodeId.toString()));

      if (watchedIds.size === 0) return null;
      if (watchedIds.size === episodes.length) return null;

      const nextEpisode = episodes.find((e) => !watchedIds.has(e._id.toString()) && e.airDate && e.airDate <= now);
      if (!nextEpisode) return null;

      const lastWatchedAt = progressList.reduce(
        (latest, p) => (!latest || p.watchedAt > latest ? p.watchedAt : latest),
        null,
      );

      const remainingEpisodes = episodes.filter(
        (e) => !watchedIds.has(e._id.toString()) && e.airDate && e.airDate <= now,
      );
      const remainingCount = remainingEpisodes.length;
      const totalRemainingDuration = remainingEpisodes.reduce((sum, e) => sum + (e.duration ?? 0), 0);

      const series = tracked.seriesId;
      const seasonData = series.seasons?.find((s) => s.seasonNumber === nextEpisode.seasonNumber);
      const isSeriesEnded = ["Ended", "Canceled"].includes(series.status);

      return {
        seriesId: seriesIdStr,
        tmdbId: tracked.tmdbId,
        title: series.title,
        isSeriesEnded,
        posterPath: seasonData?.posterPath ?? series.posterPath ?? null,
        watchedCount: watchedIds.size,
        totalCount: episodes.length,
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
    })
    .filter(Boolean);

  return results.sort((a, b) => new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt));
};

export const getContinueWatchingCount = async (UserModel, userId) => {
  await dbConnect();
  const user = await UserModel.findById(userId).select("trackedSeries").lean();
  if (!user) return 0;
  return user.trackedSeries.filter((t) => t.status !== "dropped").length;
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
      const series = await Series.findById(episode.seriesId).select("status").lean();
      const isSeriesFinished = series && ["Ended", "Canceled"].includes(series.status);

      if (isSeriesFinished) {
        const user = await User.findById(userId);
        if (user) {
          const trackedEntry = user.trackedSeries.find((s) => s.seriesId?.toString() === episode.seriesId.toString());
          if (trackedEntry && trackedEntry.status === "watching") {
            trackedEntry.status = "completed";
            await user.save();
          }
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

export const getStartWatchingCount = async (userId) => {
  await dbConnect();
  const watchlist = await UserList.findOne({ userId, isDefault: true }).select("series").lean();
  return watchlist?.series?.length ?? 0;
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

  const user = await UserModel.findById(userId)
    .select("trackedSeries")
    .populate({
      path: "trackedSeries.seriesId",
      model: "Series",
      select: "tmdbId title seasons networks posterPath",
    })
    .lean();
  if (!user) throw new Error("User not found");

  const watchingSeries = user.trackedSeries.filter((t) => t.seriesId && t.status !== "dropped");
  const watchlist = await UserList.findOne({ userId, isDefault: true })
    .populate({
      path: "series",
      model: "Series",
      select: "tmdbId title seasons networks posterPath",
    })
    .lean();
  const watchlistSeries = watchlist?.series ?? [];

  if (watchingSeries.length === 0 && watchlistSeries.length === 0) return [];

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

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
    .select("_id tmdbEpisodeId seriesId seasonNumber episodeNumber title airDate overview duration ratings")
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
      tmdbEpisodeId: ep.tmdbEpisodeId,
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

  const result = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, episodes]) => {
      const bySeason = new Map();
      for (const ep of episodes) {
        const key = `${ep.seriesId}__${ep.seasonNumber}`;
        if (!bySeason.has(key)) bySeason.set(key, []);
        bySeason.get(key).push(ep);
      }

      const finalItems = [];
      for (const [, eps] of bySeason) {
        // Tri par numéro d'épisode (utile pour l'affichage liste/plage)
        eps.sort((a, b) => a.episodeNumber - b.episodeNumber);
        const first = eps[0];

        const isFullSeason = first.seasonEpisodeCount != null && eps.length === first.seasonEpisodeCount;

        finalItems.push({
          type: "season-day",
          itemKey: `${first.seriesId}-s${first.seasonNumber}-${date}`,
          seriesId: first.seriesId,
          tmdbId: first.tmdbId,
          seriesTitle: first.seriesTitle,
          seasonNumber: first.seasonNumber,
          posterPath: first.posterPath,
          airDate: first.airDate,
          networks: first.networks,
          seasonEpisodeCount: first.seasonEpisodeCount,
          isFullSeason,
          episodes: eps.map((e) => ({
            episodeId: e.episodeId,
            episodeNumber: e.episodeNumber,
            title: e.title,
            overview: e.overview,
            duration: e.duration,
            ratings: e.ratings,
          })),
        });
      }

      // Trie : épisodes par seasonNumber/episodeNumber, batch en premier dans le jour
      finalItems.sort((a, b) => a.seasonNumber - b.seasonNumber);
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

const buildEpisodeCastFromTmdb = (credits, limit = 20) => {
  if (!credits) return [];
  const regular = (credits.cast ?? []).map((c) => ({
    tmdbId: c.id,
    name: c.name,
    character: c.character || null,
    profilePath: c.profile_path ?? null,
    order: c.order,
    isGuest: false,
  }));
  const guests = (credits.guest_stars ?? []).map((c) => ({
    tmdbId: c.id,
    name: c.name,
    character: c.character || null,
    profilePath: c.profile_path ?? null,
    order: c.order,
    isGuest: true,
  }));
  return [...regular, ...guests].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)).slice(0, limit);
};

const buildEpisodeCrewFromTmdb = (credits, limit = 10) => {
  if (!credits?.crew) return [];
  const priorityJobs = ["Director", "Writer", "Screenplay", "Story"];
  return credits.crew
    .filter((c) => priorityJobs.includes(c.job))
    .slice(0, limit)
    .map((c) => ({
      tmdbId: c.id,
      name: c.name,
      job: c.job,
      department: c.department,
      profilePath: c.profile_path ?? null,
    }));
};

const buildEpisodeVideosFromTmdb = (videosResponse) => {
  if (!videosResponse?.results) return [];
  return videosResponse.results
    .filter((v) => v.official && v.site === "YouTube")
    .map((v) => ({
      key: v.key,
      name: v.name,
      type: v.type,
      publishedAt: v.published_at ? new Date(v.published_at) : null,
    }));
};

/**
 * Sync le cast/crew/videos d'un épisode depuis TMDB si stale (>7j).
 */
const syncEpisodeIfStale = async (episode) => {
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const isStale = !episode.lastSyncedAt || Date.now() - new Date(episode.lastSyncedAt) > SEVEN_DAYS;
  if (!isStale) return episode;

  const tmdbData = await getEpisodeDetails(episode.tmdbSeriesId, episode.seasonNumber, episode.episodeNumber);
  if (!tmdbData) return episode;

  const updated = await Episode.findByIdAndUpdate(
    episode._id,
    {
      $set: {
        cast: buildEpisodeCastFromTmdb(tmdbData.credits),
        crew: buildEpisodeCrewFromTmdb(tmdbData.credits),
        videos: buildEpisodeVideosFromTmdb(tmdbData.videos),
        lastSyncedAt: new Date(),
      },
    },
    { returnDocument: "after", runValidators: true },
  ).lean();

  return updated ?? episode;
};

/**
 * Récupère toutes les données nécessaires à la page épisode.
 * Renvoie l'épisode (avec cast/crew/videos), la série parente, les épisodes de la saison
 * avec leur progress utilisateur, et le progress de l'épisode courant.
 */
export const getEpisodeFullData = async (userId, tmdbEpisodeId) => {
  await dbConnect();

  let episode = await Episode.findOne({ tmdbEpisodeId: Number(tmdbEpisodeId) }).lean();
  if (!episode) throw new Error("Episode not found");

  episode = await syncEpisodeIfStale(episode);

  const series = await Series.findById(episode.seriesId).lean();
  if (!series) throw new Error("Series not found");

  // Tous les épisodes de la même saison
  const seasonEpisodes = await Episode.find({
    seriesId: episode.seriesId,
    seasonNumber: episode.seasonNumber,
  })
    .sort({ episodeNumber: 1 })
    .select("_id tmdbEpisodeId seasonNumber episodeNumber title stillPath airDate duration ratings")
    .lean();

  // Progress utilisateur sur ces épisodes
  let progressBySeasonEpisode = new Map();
  let currentProgress = null;

  if (userId) {
    const seasonEpisodeIds = seasonEpisodes.map((e) => e._id);
    const progressList = await EpisodeProgress.find({
      userId,
      episodeId: { $in: seasonEpisodeIds },
    })
      .select("episodeId watched watchedAt rating")
      .lean();

    progressBySeasonEpisode = new Map(progressList.map((p) => [p.episodeId.toString(), p]));
    const cp = progressBySeasonEpisode.get(episode._id.toString());
    if (cp) {
      currentProgress = {
        watched: cp.watched ?? false,
        watchedAt: cp.watchedAt ? cp.watchedAt.toISOString() : null,
        rating: cp.rating ?? null,
      };
    }
  }

  return {
    episode: {
      ...episode,
      _id: episode._id.toString(),
      seriesId: episode.seriesId.toString(),
      airDate: episode.airDate ? episode.airDate.toISOString() : null,
      cast: (episode.cast ?? []).map(({ _id, ...rest }) => rest),
      crew: (episode.crew ?? []).map(({ _id, ...rest }) => rest),
      videos: (episode.videos ?? []).map(({ _id, ...rest }) => ({
        ...rest,
        publishedAt: rest.publishedAt ? rest.publishedAt.toISOString() : null,
      })),
    },
    series: {
      _id: series._id.toString(),
      tmdbId: series.tmdbId,
      title: series.title,
      posterPath: series.posterPath,
      backdropPath: series.backdropPath,
      seasons: (series.seasons ?? []).map((s) => ({
        seasonNumber: s.seasonNumber,
        episodeCount: s.episodeCount,
        tmdbSeasonId: s.tmdbSeasonId,
        name: s.name,
        posterPath: s.posterPath,
        airDate: s.airDate ? s.airDate.toISOString() : null,
      })),
    },
    seasonEpisodes: seasonEpisodes.map((ep) => {
      const p = progressBySeasonEpisode.get(ep._id.toString());
      return {
        ...ep,
        _id: ep._id.toString(),
        seriesId: episode.seriesId.toString(),
        airDate: ep.airDate ? ep.airDate.toISOString() : null,
        watched: p?.watched ?? false,
        watchedAt: p?.watchedAt ? p.watchedAt.toISOString() : null,
        rating: p?.rating ?? null,
      };
    }),
    currentProgress,
  };
};

// Fonction privée partagée — fetch + join + tri
const _fetchWatchedEpisodes = async (userId, since = null) => {
  const query = { userId, watched: true };
  if (since) query.watchedAt = { $gte: since };

  const progressList = await EpisodeProgress.find(query).sort({ watchedAt: -1 }).limit(500).lean();

  if (progressList.length === 0) return [];

  const episodeIds = progressList.map((p) => p.episodeId);
  const episodes = await Episode.find({ _id: { $in: episodeIds } })
    .select("_id tmdbEpisodeId seriesId seasonNumber episodeNumber title stillPath airDate duration ratings")
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
        tmdbEpisodeId: ep.tmdbEpisodeId,
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
