// scripts/resyncAll.js
import mongoose from "mongoose";
import dbConnect from "../src/lib/db/db.connect.js";
import { Series } from "../src/models/series.model.js";
import { upsertEpisodes } from "../src/lib/db/upsertEpisodes.js";
import { getAllSeasonsWithEpisodes } from "../src/lib/api/tmdb.api.js";
import { getOmdbRatings } from "../src/lib/api/omdb.api.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const resyncSeries = async (series) => {
  const tmdbId = series.tmdbId;

  const result = await getAllSeasonsWithEpisodes(tmdbId);
  if (!result?.seriesDetails || !result?.seasons) {
    throw new Error("TMDB returned no data");
  }
  const { seriesDetails, seasons } = result;

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

  await Series.findOneAndUpdate(
    { tmdbId },
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

const main = async () => {
  await dbConnect();
  console.log("✓ Connected to MongoDB");

  const allSeries = await Series.find({}).select("_id tmdbId title releaseTimeOverride").lean();
  console.log(`✓ Found ${allSeries.length} series to resync\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < allSeries.length; i++) {
    const s = allSeries[i];
    const prefix = `[${i + 1}/${allSeries.length}]`;
    try {
      console.log(`${prefix} Syncing "${s.title}" (${s.tmdbId})...`);
      await resyncSeries(s);
      success++;
      // Throttle pour ne pas claquer les rate limits TMDB (~50 req/sec max)
      await sleep(300);
    } catch (err) {
      failed++;
      console.error(`${prefix} ✗ Failed for "${s.title}": ${err.message}`);
    }
  }

  console.log(`\n✓ Done. Success: ${success}, Failed: ${failed}`);
  await mongoose.disconnect();
  process.exit(0);
};

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
