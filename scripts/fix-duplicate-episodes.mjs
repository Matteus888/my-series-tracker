// scripts/fix-duplicate-episodes.mjs
import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_ID = 37854; // ⚠️ ton vrai tmdbId
const OFFSET = -1;

const Episode = mongoose.model("Episode", new mongoose.Schema({}, { strict: false }), "episodes");
const Series = mongoose.model("Series", new mongoose.Schema({}, { strict: false }), "series");

async function getAllSeasonsWithEpisodes(tmdbId) {
  const detailsRes = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}`);
  const details = await detailsRes.json();
  const regularSeasons = (details.seasons ?? []).filter((s) => s.season_number > 0);
  const seasons = [];
  for (const s of regularSeasons) {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${tmdbId}/season/${s.season_number}?api_key=${TMDB_API_KEY}`,
    );
    seasons.push(await res.json());
  }
  return seasons;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const series = await Series.findOne({ tmdbId: TMDB_ID });
  if (!series) throw new Error("Series not found");

  const seasons = await getAllSeasonsWithEpisodes(TMDB_ID);
  const tmdbMap = new Map(); // tmdbEpisodeId -> { seasonNumber, episodeNumber (avec offset) }
  for (const season of seasons) {
    for (const ep of season.episodes ?? []) {
      if (!ep.id) continue;
      tmdbMap.set(ep.id, { seasonNumber: season.season_number, episodeNumber: ep.episode_number + OFFSET });
    }
  }
  console.log(`${tmdbMap.size} épisodes valides sur TMDB.`);

  const dbEpisodes = await Episode.find({ seriesId: series._id })
    .select("_id tmdbEpisodeId seasonNumber episodeNumber")
    .lean();
  console.log(`${dbEpisodes.length} épisodes en base.`);

  const known = dbEpisodes.filter((ep) => tmdbMap.has(ep.tmdbEpisodeId));
  const orphans = dbEpisodes.filter((ep) => !tmdbMap.has(ep.tmdbEpisodeId));

  // Passe 1 : tout en négatif (par _id, jamais de collision possible)
  const negateOps = known.map((ep) => ({
    updateOne: {
      filter: { _id: ep._id },
      update: [{ $set: { episodeNumber: { $multiply: ["$episodeNumber", -1] } } }],
    },
  }));
  if (negateOps.length) await Episode.bulkWrite(negateOps, { ordered: false });

  // Passe 2 : saison + numéro corrects, recalculés depuis TMDB
  const finalOps = known.map((ep) => {
    const target = tmdbMap.get(ep.tmdbEpisodeId);
    return {
      updateOne: {
        filter: { _id: ep._id },
        update: { $set: { seasonNumber: target.seasonNumber, episodeNumber: target.episodeNumber } },
      },
    };
  });
  const r2 = await Episode.bulkWrite(finalOps, { ordered: false });
  console.log(`Passe 2 : ${r2.modifiedCount} épisodes corrigés (saison + numéro).`);

  if (orphans.length) {
    console.log(`⚠️ ${orphans.length} épisode(s) en base introuvable(s) sur TMDB (non touchés, à vérifier) :`);
    console.log(orphans);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
