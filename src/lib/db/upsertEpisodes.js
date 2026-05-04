import { Episode } from "@/models/episode.model";
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
export const upsertEpisodes = async (seriesId, tmdbSeriesId, seasons, networks = [], releaseTimeOverride = null) => {
  const operations = [];

  for (const season of seasons) {
    for (const ep of season.episodes) {
      const filter = ep.id
        ? { tmdbEpisodeId: ep.id }
        : { seriesId, seasonNumber: season.season_number, episodeNumber: ep.episode_number };

      const update = {
        $set: {
          seriesId,
          tmdbSeriesId,
          tmdbEpisodeId: ep.id ?? undefined,
          seasonNumber: season.season_number,
          episodeNumber: ep.episode_number,
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
