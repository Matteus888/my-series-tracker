// scripts/diagnose-episodes.mjs
import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";

const TMDB_ID = 37854;
const Episode = mongoose.model("Episode", new mongoose.Schema({}, { strict: false }), "episodes");
const Series = mongoose.model("Series", new mongoose.Schema({}, { strict: false }), "series");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const series = await Series.findOne({ tmdbId: TMDB_ID });
  if (!series) throw new Error("Series not found");

  const all = await Episode.find({ seriesId: series._id })
    .select("_id tmdbEpisodeId seasonNumber episodeNumber title")
    .sort({ seasonNumber: 1, episodeNumber: 1 })
    .lean();

  console.log(`Total en base : ${all.length}`);

  // Groupe par (seasonNumber, episodeNumber) pour trouver les vrais doublons
  const groups = new Map();
  for (const ep of all) {
    const key = `${ep.seasonNumber}-${ep.episodeNumber}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(ep);
  }

  const duplicates = [...groups.entries()].filter(([, eps]) => eps.length > 1);
  console.log(`\nPaires (saison, épisode) en doublon : ${duplicates.length}`);
  for (const [key, eps] of duplicates) {
    console.log(`\n--- ${key} ---`);
    for (const ep of eps) {
      console.log(`  _id=${ep._id} tmdbEpisodeId=${ep.tmdbEpisodeId} title="${ep.title}"`);
    }
  }

  // Épisodes avec un numéro négatif ou nul restants (traces d'un run précédent avorté)
  const negatives = all.filter((ep) => ep.episodeNumber <= 0);
  console.log(`\nÉpisodes avec numéro <= 0 : ${negatives.length}`);
  for (const ep of negatives.slice(0, 20)) {
    console.log(
      `  _id=${ep._id} season=${ep.seasonNumber} ep=${ep.episodeNumber} tmdbEpisodeId=${ep.tmdbEpisodeId} title="${ep.title}"`,
    );
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
