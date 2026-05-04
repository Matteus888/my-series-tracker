import { Series } from "@/models/series.model";
import { User } from "@/models/user.model";
import { Episode } from "@/models/episode.model";
import { UserList } from "@/models/userList.model";
import { EpisodeProgress } from "@/models/episodeProgress.model";
import { getAllSeasonsWithEpisodes, getSeriesDetails, getSeriesVideos, getSeasonVideos } from "./tmdb.api";
import { getOmdbRatings } from "./omdb.api";
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
        networks:
          seriesDetails.networks?.map((n) => ({
            id: n.id,
            name: n.name,
            logoPath: n.logo_path ?? null,
          })) ?? [],
        cast: buildCastFromTmdb(seriesDetails.aggregate_credits),
        createdBy: buildCreatedByFromTmdb(seriesDetails.created_by),
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

  const episodeIdMap = await upsertEpisodes(series._id, Number(tmdbId), seasons, seriesDetails.networks ?? [], null);

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
    const now = new Date();

    const progressDocs = seasons.flatMap((season) =>
      season.episodes
        .filter((ep) => ep.air_date && new Date(ep.air_date) <= now)
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

  if (options.markFirstWatched) {
    const now = new Date();

    let firstEpisodeId = null;
    outer: for (const season of seasons) {
      const sorted = [...season.episodes].sort((a, b) => a.episode_number - b.episode_number);
      for (const ep of sorted) {
        if (ep.air_date && new Date(ep.air_date) <= now) {
          firstEpisodeId = episodeIdMap.get(ep.id) ?? episodeIdMap.get(`${season.season_number}-${ep.episode_number}`);
          if (firstEpisodeId) break outer;
        }
      }
    }

    if (firstEpisodeId) {
      await EpisodeProgress.findOneAndUpdate(
        { userId, episodeId: firstEpisodeId },
        { $set: { watched: true, watchedAt: new Date() } },
        { upsert: true, runValidators: true },
      );
    }

    const watchlist = await UserList.findOne({ userId, isDefault: true });
    if (watchlist) {
      await UserList.findByIdAndUpdate(watchlist._id, { $pull: { series: series._id } });
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

export const syncSeriesIfStale = async (SeriesModel, tmdbId) => {
  await dbConnect();

  const series = await SeriesModel.findOne({ tmdbId: Number(tmdbId) }).lean();
  if (!series) return;

  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const isStale = !series.lastSyncedAt || Date.now() - new Date(series.lastSyncedAt) > SEVEN_DAYS;
  if (!isStale) return;

  const { seriesDetails, seasons } = await getAllSeasonsWithEpisodes(tmdbId);
  if (!seriesDetails || !seasons) return;

  const imdbId = seriesDetails.external_ids?.imdb_id ?? null;
  const omdbRatings = imdbId ? await getOmdbRatings(imdbId) : null;

  const seasonsData = seasons.map((season) => ({
    seasonNumber: season.season_number,
    episodeCount: season.episodes.length,
    tmdbSeasonId: season.id,
    name: season.name,
    posterPath: season.poster_path,
    airDate: season.air_date ? new Date(season.air_date) : null,
  }));

  await SeriesModel.findOneAndUpdate(
    { tmdbId: Number(tmdbId) },
    {
      $set: {
        title: seriesDetails.name,
        overview: seriesDetails.overview,
        posterPath: seriesDetails.poster_path,
        backdropPath: seriesDetails.backdrop_path,
        genres: seriesDetails.genres?.map((g) => g.name) ?? [],
        numberOfSeasons: seriesDetails.number_of_seasons,
        numberOfEpisodes: seriesDetails.number_of_episodes,
        status: seriesDetails.status,
        seasons: seasonsData,
        networks:
          seriesDetails.networks?.map((n) => ({
            id: n.id,
            name: n.name,
            logoPath: n.logo_path ?? null,
          })) ?? [],
        cast: buildCastFromTmdb(seriesDetails.aggregate_credits),
        createdBy: buildCreatedByFromTmdb(seriesDetails.created_by),
        lastSyncedAt: new Date(),
        imdbId,
        "ratings.tmdb.score": seriesDetails.vote_average,
        "ratings.tmdb.voteCount": seriesDetails.vote_count,
        "ratings.imdb.score": omdbRatings?.imdb?.score ?? null,
        "ratings.imdb.voteCount": omdbRatings?.imdb?.voteCount ?? null,
        "ratings.lastFetched": new Date(),
      },
    },
    { runValidators: true },
  );

  await upsertEpisodes(
    series._id,
    Number(tmdbId),
    seasons,
    seriesDetails.networks ?? [],
    series.releaseTimeOverride ?? null,
  );
};

export const getSeriesProgress = async (userId, UserModel) => {
  await dbConnect();

  const user = await UserModel.findById(userId).lean();
  if (!user) throw new Error("User not found");

  const results = await Promise.all(
    user.trackedSeries.map(async ({ tmdbId, seriesId }) => {
      const episodes = await getEpisodeProgressForSeries(userId, seriesId);
      const watchedCount = episodes.filter((ep) => ep.watched).length;
      const totalCount = episodes.length;
      return { tmdbId, watchedCount, totalCount };
    }),
  );

  return results;
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
