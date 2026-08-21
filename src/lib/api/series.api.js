import { Series } from "@/models/series.model";
import { User } from "@/models/user.model";
import { Episode } from "@/models/episode.model";
import { UserList } from "@/models/userList.model";
import { EpisodeProgress } from "@/models/episodeProgress.model";
import {
  getNetworkDetails,
  getAllSeasonsWithEpisodes,
  getSeriesDetails,
  getSeriesVideos,
  getSeasonVideos,
} from "./tmdb.api";
import { getOmdbRatings } from "./omdb.api";
import { getTraktRatings } from "./trakt.api";
import { invalidateSuggestionsCache } from "./suggestions.api";
import { upsertEpisodes } from "@/lib/db/upsertEpisodes";
import dbConnect from "@/lib/db/db.connect";

const buildCastFromTmdb = (aggregateCredits, limit = 20) => {
  if (!aggregateCredits?.cast) return [];

  return (
    aggregateCredits.cast
      // Trie par nombre d'épisodes décroissant (les plus présents en haut)
      .sort((a, b) => (b.total_episode_count ?? 0) - (a.total_episode_count ?? 0))
      .slice(0, limit)
      .map((c) => {
        // Concatène les rôles si l'acteur a joué plusieurs personnages
        const character = (c.roles ?? [])
          .map((r) => r.character)
          .filter(Boolean)
          .join(" / ");

        return {
          tmdbId: c.id,
          name: c.name,
          character: character || null,
          profilePath: c.profile_path ?? null,
          order: c.order,
        };
      })
  );
};

const buildCreatedByFromTmdb = (createdBy = []) => {
  return createdBy.map((c) => ({
    tmdbId: c.id,
    name: c.name,
    profilePath: c.profile_path ?? null,
  }));
};

/**
 * Enrichit les networks bruts de TMDB avec la homepage du diffuseur.
 *
 * Optimisation : si un autre Series document a déjà la homepage pour un network donné,
 * on la réutilise pour éviter un appel TMDB redondant.
 *
 * @param {Array} rawNetworks - networks tels que retournés par getSeriesDetails
 * @returns {Promise<Array>} networks au format du schéma Mongoose
 */
const buildNetworksFromTmdb = async (rawNetworks = []) => {
  if (rawNetworks.length === 0) return [];

  const ids = rawNetworks.map((n) => n.id);

  // Cherche en base les homepages déjà connues pour ces networks
  const cached = await Series.aggregate([
    { $match: { "networks.id": { $in: ids } } },
    { $unwind: "$networks" },
    {
      $match: {
        "networks.id": { $in: ids },
        "networks.homepage": { $exists: true, $nin: [null, ""] },
      },
    },
    { $group: { _id: "$networks.id", homepage: { $first: "$networks.homepage" } } },
  ]);

  const homepageCache = new Map(cached.map((c) => [c._id, c.homepage]));

  // Pour les networks pas encore en cache, fetch TMDB en parallèle
  return Promise.all(
    rawNetworks.map(async (n) => {
      let homepage = homepageCache.get(n.id) ?? null;

      if (!homepage) {
        const details = await getNetworkDetails(n.id);
        homepage = details?.homepage?.trim() || null;
      }

      return {
        id: n.id,
        name: n.name,
        logoPath: n.logo_path ?? null,
        homepage,
      };
    }),
  );
};

/**
 * Crée ou met à jour la série en base avec toutes ses metadata + notes,
 * sans la lier à un user. Met aussi à jour les épisodes via upsertEpisodes.
 *
 * Utilisable pour cacher la fiche série dès qu'elle est consultée,
 * même par un visiteur non connecté ou non trackeur.
 *
 * Cache 7 jours : si la série a été sync récemment, retourne le doc existant.
 *
 * @returns {Promise<Object|null>} le document Series (lean), ou null si TMDB échoue
 */
export const ensureSeriesInDb = async (SeriesModel, tmdbId) => {
  await dbConnect();

  const numericId = Number(tmdbId);
  const existing = await SeriesModel.findOne({ tmdbId: numericId }).lean();

  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const isFresh = existing?.lastSyncedAt && Date.now() - new Date(existing.lastSyncedAt) < SEVEN_DAYS;
  if (isFresh) return existing;

  const data = await getAllSeasonsWithEpisodes(numericId);
  if (!data?.seriesDetails || !data?.seasons) return existing ?? null;

  const { seriesDetails, seasons } = data;

  const imdbId = seriesDetails.external_ids?.imdb_id ?? null;
  const [omdbRatings, traktRating] = imdbId
    ? await Promise.all([getOmdbRatings(imdbId), getTraktRatings(imdbId)])
    : [null, null];

  const seasonsData = seasons.map((season) => ({
    seasonNumber: season.season_number,
    episodeCount: season.episodes.length,
    tmdbSeasonId: season.id,
    name: season.name,
    posterPath: season.poster_path,
    airDate: season.air_date ? new Date(season.air_date) : null,
  }));

  const networksData = await buildNetworksFromTmdb(seriesDetails.networks);

  const updated = await SeriesModel.findOneAndUpdate(
    { tmdbId: numericId },
    {
      $set: {
        tmdbId: numericId,
        title: seriesDetails.name,
        originalTitle: seriesDetails.original_name,
        overview: seriesDetails.overview,
        tagline: seriesDetails.tagline ?? null,
        posterPath: seriesDetails.poster_path,
        backdropPath: seriesDetails.backdrop_path,
        firstAirDate: seriesDetails.first_air_date ? new Date(seriesDetails.first_air_date) : null,
        lastAirDate: seriesDetails.last_air_date ? new Date(seriesDetails.last_air_date) : null,
        status: seriesDetails.status,
        genres: seriesDetails.genres?.map((g) => g.name) ?? [],
        numberOfSeasons: seriesDetails.number_of_seasons,
        numberOfEpisodes: seriesDetails.number_of_episodes,
        seasons: seasonsData,
        networks: networksData,
        cast: buildCastFromTmdb(seriesDetails.aggregate_credits),
        createdBy: buildCreatedByFromTmdb(seriesDetails.created_by),
        imdbId,
        lastSyncedAt: new Date(),
        "ratings.tmdb.score": seriesDetails.vote_average,
        "ratings.tmdb.voteCount": seriesDetails.vote_count,
        "ratings.imdb.score": omdbRatings?.imdb?.score ?? null,
        "ratings.imdb.voteCount": omdbRatings?.imdb?.voteCount ?? null,
        "ratings.rottenTomatoes.score": omdbRatings?.rottenTomatoes?.score ?? null,
        "ratings.metacritic.score": omdbRatings?.metacritic?.score ?? null,
        "ratings.trakt.score": traktRating?.score ?? null,
        "ratings.trakt.voteCount": traktRating?.voteCount ?? null,
        "ratings.lastFetched": new Date(),
      },
    },
    { upsert: true, returnDocument: "after", runValidators: true },
  ).lean();

  await upsertEpisodes(
    updated._id,
    numericId,
    seasons,
    seriesDetails.networks ?? [],
    updated.releaseTimeOverride ?? null,
    updated.episodeNumberOffset ?? 0,
  );

  return updated;
};

export const addTrackedSeries = async (UserModel, SeriesModel, userId, tmdbId, serieData, options = {}) => {
  await dbConnect();

  // 1. S'assure que la série est en base (avec toutes ses notes et épisodes)
  const series = await ensureSeriesInDb(SeriesModel, tmdbId);
  if (!series) throw new Error("Could not fetch series details");

  // 2. Récupère la map des episode IDs pour le markAllWatched / markFirstWatched
  const episodes = await Episode.find({ seriesId: series._id })
    .select("_id tmdbEpisodeId seasonNumber episodeNumber airDate")
    .lean();

  const episodeIdMap = new Map();
  for (const ep of episodes) {
    if (ep.tmdbEpisodeId) episodeIdMap.set(ep.tmdbEpisodeId, ep._id);
    episodeIdMap.set(`${ep.seasonNumber}-${ep.episodeNumber}`, ep._id);
  }

  // 3. Lie la série au user
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

  // 4. markAllWatched
  if (options.markAllWatched) {
    const now = new Date();

    // Date de visionnage choisie par l'utilisateur (ISO string) ou maintenant.
    // Clamp anti-date-future par sécurité (le front borne déjà, mais on se protège).
    const chosen = options.watchedAt ? new Date(options.watchedAt) : now;
    const watchedAt = isNaN(chosen.getTime()) || chosen > now ? now : chosen;

    const progressDocs = episodes
      .filter((ep) => ep.airDate && ep.airDate <= now)
      .map((ep) => ({
        userId,
        episodeId: ep._id,
        watched: true,
        watchedAt,
      }));

    if (progressDocs.length > 0) {
      await EpisodeProgress.insertMany(progressDocs, { ordered: false }).catch((err) => {
        if (err.code !== 11000) throw err;
      });
    }

    const watchlist = await UserList.findOne({ userId, isDefault: true });
    if (watchlist) {
      await UserList.findByIdAndUpdate(watchlist._id, { $pull: { series: series._id } });
    }
  }

  // 5. markFirstWatched
  if (options.markFirstWatched) {
    const now = new Date();
    const sortedEpisodes = [...episodes].sort(
      (a, b) => a.seasonNumber - b.seasonNumber || a.episodeNumber - b.episodeNumber,
    );
    const firstAired = sortedEpisodes.find((ep) => ep.airDate && ep.airDate <= now);

    if (firstAired) {
      await EpisodeProgress.findOneAndUpdate(
        { userId, episodeId: firstAired._id },
        { $set: { watched: true, watchedAt: new Date() } },
        { upsert: true, runValidators: true },
      );
    }

    const watchlist = await UserList.findOne({ userId, isDefault: true });
    if (watchlist) {
      await UserList.findByIdAndUpdate(watchlist._id, { $pull: { series: series._id } });
    }
  }

  // 6. Invalide le cache des suggestions (les goûts ont changé)
  invalidateSuggestionsCache(UserModel, userId).catch(() => {});

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

  // Invalide le cache des suggestions (les goûts ont changé)
  invalidateSuggestionsCache(UserModel, userId).catch(() => {});

  return user.trackedSeries;
};

export const updateTrackedSeries = async (UserModel, userId, tmdbId, updates) => {
  await dbConnect();
  const user = await UserModel.findById(userId);
  if (!user) throw new Error("User not found");

  const existingSerieIndex = user.trackedSeries.findIndex((s) => s.tmdbId?.toString() === tmdbId.toString());
  if (existingSerieIndex === -1) throw new Error("Serie not tracked");

  const allowedFields = ["isFavorite", "status", "rating"];
  let tasteChanged = false;
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      user.trackedSeries[existingSerieIndex][field] = updates[field];
      tasteChanged = true;
    }
  });
  await user.save();

  // Invalide le cache si un signal de goût a été modifié
  if (tasteChanged) {
    invalidateSuggestionsCache(UserModel, userId).catch(() => {});
  }

  return user.trackedSeries;
};

export const getEpisodeProgressForSeries = async (userId, seriesId) => {
  await dbConnect();

  const episodes = await Episode.find({ seriesId })
    .select("_id tmdbEpisodeId seriesId seasonNumber episodeNumber title stillPath airDate duration ratings overview")
    .sort({ seasonNumber: 1, episodeNumber: 1 })
    .lean();

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

export const getSeriesProgress = async (userId, UserModel) => {
  await dbConnect();

  const user = await UserModel.findById(userId)
    .select("trackedSeries")
    .populate({
      path: "trackedSeries.seriesId",
      model: "Series",
      select: "ratings",
    })
    .lean();
  if (!user) throw new Error("User not found");

  if (user.trackedSeries.length === 0) return [];

  const seriesIds = user.trackedSeries.map((t) => t.seriesId?._id ?? t.seriesId).filter(Boolean);

  // ─── 1 SEULE requête pour tous les épisodes ───
  const allEpisodes = await Episode.find({ seriesId: { $in: seriesIds } })
    .select("_id seriesId")
    .lean();

  // Comptage des épisodes par série
  const totalBySeries = new Map();
  const episodeIdToSeriesId = new Map();
  for (const ep of allEpisodes) {
    const seriesKey = ep.seriesId.toString();
    totalBySeries.set(seriesKey, (totalBySeries.get(seriesKey) ?? 0) + 1);
    episodeIdToSeriesId.set(ep._id.toString(), seriesKey);
  }

  // ─── 1 SEULE requête pour tous les progress watched ───
  const allEpisodeIds = allEpisodes.map((e) => e._id);
  const watchedList = await EpisodeProgress.find({
    userId,
    episodeId: { $in: allEpisodeIds },
    watched: true,
  })
    .select("episodeId")
    .lean();

  // Comptage des watched par série
  const watchedBySeries = new Map();
  for (const p of watchedList) {
    const seriesKey = episodeIdToSeriesId.get(p.episodeId.toString());
    if (!seriesKey) continue;
    watchedBySeries.set(seriesKey, (watchedBySeries.get(seriesKey) ?? 0) + 1);
  }

  // ─── Construction du résultat (synchrone, instantané) ───
  return user.trackedSeries.map(({ tmdbId, seriesId }) => {
    const seriesKey = (seriesId?._id ?? seriesId)?.toString();
    return {
      tmdbId,
      watchedCount: watchedBySeries.get(seriesKey) ?? 0,
      totalCount: totalBySeries.get(seriesKey) ?? 0,
      ratings: seriesId?.ratings ?? null,
    };
  });
};

export async function fetchSeriesVideos(tmdbId) {
  const numericId = Number(tmdbId);

  // Récupère les saisons depuis la base si la série est déjà sync
  const serie = await Series.findOne({ tmdbId: numericId }).lean();

  let seasonNumbers = [];
  if (serie?.seasons?.length) {
    seasonNumbers = serie.seasons.map((s) => s.seasonNumber).filter((n) => n > 0);
  } else {
    // Fallback : fetch TMDB si la série n'est pas en base
    const detail = await getSeriesDetails(numericId);
    if (!detail) return [];
    seasonNumbers = (detail.seasons ?? []).map((s) => s.season_number).filter((n) => n > 0);
  }

  const [mainVideos, ...seasonVideosArr] = await Promise.all([
    getSeriesVideos(numericId),
    ...seasonNumbers.map((n) => getSeasonVideos(numericId, n)),
  ]);

  const videos = [];

  for (const v of mainVideos) {
    if (!v.official || v.site !== "YouTube") continue;
    videos.push({
      key: v.key,
      name: v.name,
      type: v.type,
      source: "main",
      sourceLabel: "Series",
      publishedAt: v.published_at,
    });
  }

  seasonVideosArr.forEach((seasonVideos, idx) => {
    const seasonNumber = seasonNumbers[idx];
    for (const v of seasonVideos) {
      if (!v.official || v.site !== "YouTube") continue;
      videos.push({
        key: v.key,
        name: v.name,
        type: v.type,
        source: `season-${seasonNumber}`,
        sourceLabel: `Season ${seasonNumber}`,
        publishedAt: v.published_at,
      });
    }
  });

  videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return videos;
}
