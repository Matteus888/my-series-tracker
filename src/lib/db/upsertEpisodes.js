import { Episode } from "@/models/episode.model";
import { EpisodeProgress } from "@/models/episodeProgress.model";
import { computeAirDateTime } from "../utils/airDateTime.utils";

/**
 * Crée ou met à jour tous les épisodes d'une série en base.
 * Retourne un Map tmdbEpisodeId → ObjectId pour la création des EpisodeProgress.
 *
 * @param {ObjectId} seriesId   - _id MongoDB de la Series
 * @param {number}   tmdbSeriesId
 * @param {Array}    seasons    - tableau retourné par getAllSeasonsWithEpisodes
 * @param {Array}    networks   - networks de la série (pour ajuster l'airDate)
 * @returns {Promise<Map<number, ObjectId>>}  tmdbEpisodeId → episode._id
 */
export const upsertEpisodes = async (
  seriesId,
  tmdbSeriesId,
  seasons,
  networks = [],
  releaseTimeOverride = null,
  episodeNumberOffset = 0,
) => {
  const operations = [];

  for (const season of seasons) {
    for (const ep of season.episodes) {
      const filter = { seriesId, seasonNumber: season.season_number, episodeNumber: ep.episode_number };

      const update = {
        $set: {
          seriesId,
          tmdbSeriesId,
          tmdbEpisodeId: ep.id ?? undefined,
          seasonNumber: season.season_number,
          episodeNumber: ep.episode_number + episodeNumberOffset,
          title: ep.name ?? null,
          overview: ep.overview ?? null,
          stillPath: ep.still_path ?? null,
          airDate: computeAirDateTime(ep.air_date, networks, {
            override: releaseTimeOverride,
            tmdbAirTime: season.air_time,
          }),
          duration: ep.runtime ?? null,
          "ratings.tmdb.score": ep.vote_average ?? null,
          "ratings.tmdb.voteCount": ep.vote_count ?? 0,
          "ratings.lastFetched": new Date(),
        },
      };

      operations.push({ updateOne: { filter, update, upsert: true } });
    }
  }

  if (operations.length === 0) return new Map();

  await Episode.bulkWrite(operations, { ordered: false });

  // Purge des épisodes disparus de TMDB (uniquement dans les saisons récupérées et non vides)
  const fetchedSeasons = seasons.filter((s) => s.episodes?.length > 0);
  const presentKeys = new Set(
    fetchedSeasons.flatMap((s) => s.episodes.map((ep) => `${s.season_number}-${ep.episode_number}`)),
  );
  const inDb = await Episode.find({
    seriesId,
    seasonNumber: { $in: fetchedSeasons.map((s) => s.season_number) },
  })
    .select("_id seasonNumber episodeNumber")
    .lean();

  const orphanIds = inDb.filter((e) => !presentKeys.has(`${e.seasonNumber}-${e.episodeNumber}`)).map((e) => e._id);

  if (orphanIds.length > 0) {
    const watchedIds = new Set(
      (await EpisodeProgress.distinct("episodeId", { episodeId: { $in: orphanIds } })).map(String),
    );
    const toDelete = orphanIds.filter((id) => !watchedIds.has(String(id)));
    const toNull = orphanIds.filter((id) => watchedIds.has(String(id)));
    if (toDelete.length) await Episode.deleteMany({ _id: { $in: toDelete } });
    if (toNull.length) await Episode.updateMany({ _id: { $in: toNull } }, { $set: { airDate: null } });
  }

  const episodes = await Episode.find({ seriesId }).select("_id tmdbEpisodeId seasonNumber episodeNumber").lean();

  const idMap = new Map();
  for (const ep of episodes) {
    if (ep.tmdbEpisodeId) {
      idMap.set(ep.tmdbEpisodeId, ep._id);
    } else {
      idMap.set(`${ep.seasonNumber}-${ep.episodeNumber}`, ep._id);
    }
  }
  return idMap;
};
