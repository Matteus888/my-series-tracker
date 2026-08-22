// scripts/finish-episode-resync.mjs
import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_ID = 37854;

const Episode = mongoose.model("Episode", new mongoose.Schema({}, { strict: false }), "episodes");
const Series = mongoose.model("Series", new mongoose.Schema({}, { strict: false }), "series");
const EpisodeProgress = mongoose.model(
  "EpisodeProgress",
  new mongoose.Schema({}, { strict: false }),
  "episodeprogresses",
);

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
  const tmdbMap = new Map();
  for (const season of seasons) {
    for (const ep of season.episodes ?? []) {
      if (!ep.id) continue;
      tmdbMap.set(ep.id, { seasonNumber: season.season_number, episodeNumber: ep.episode_number });
    }
  }
  console.log(`${tmdbMap.size} épisodes sur TMDB.`);

  const dbEpisodes = await Episode.find({ seriesId: series._id })
    .select("_id tmdbEpisodeId seasonNumber episodeNumber title")
    .lean();
  console.log(`${dbEpisodes.length} épisodes en base (déjà négatifs, confirmé par le diagnostic).`);

  const known = dbEpisodes.filter((ep) => tmdbMap.has(ep.tmdbEpisodeId));
  const orphans = dbEpisodes.filter((ep) => !tmdbMap.has(ep.tmdbEpisodeId));
  console.log(`known=${known.length} orphans=${orphans.length}`);

  if (orphans.length > 0) {
    console.log("\n--- Orphelins ---");
    for (const o of orphans) console.log(o);
  }

  // Réassignation directe des numéros positifs bruts TMDB — safe car le point
  // de départ est négatif partout, donc aucune collision possible avec les cibles positives
  const finalOps = known.map((ep) => {
    const t = tmdbMap.get(ep.tmdbEpisodeId);
    return {
      updateOne: {
        filter: { _id: ep._id },
        update: { $set: { seasonNumber: t.seasonNumber, episodeNumber: t.episodeNumber } },
      },
    };
  });
  const r = await Episode.bulkWrite(finalOps, { ordered: false });
  console.log(`\n${r.modifiedCount} épisodes remis à la numérotation brute TMDB.`);

  // Traitement de l'orphelin restant : on le retrouve via son ancien tmdbEpisodeId
  // (juste avant les IDs connus/remplacés) et son titre, pour trouver le bon remplaçant
  for (const orphan of orphans) {
    console.log(
      `\nOrphelin à traiter manuellement : _id=${orphan._id} tmdbEpisodeId=${orphan.tmdbEpisodeId} title="${orphan.title}"`,
    );
    const progressCount = await EpisodeProgress.countDocuments({ episodeId: orphan._id });
    console.log(`  → ${progressCount} EpisodeProgress lié(s) à cet épisode.`);
  }

  await mongoose.disconnect();
  console.log("\n✅ Terminé (voir orphelin(s) ci-dessus si présent).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
