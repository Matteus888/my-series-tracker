// scripts/fix-remaining-placeholders.mjs
import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";

const TMDB_ID = 37854;
const Episode = mongoose.model("Episode", new mongoose.Schema({}, { strict: false }), "episodes");
const Series = mongoose.model("Series", new mongoose.Schema({}, { strict: false }), "series");

const REMAINING_TMDB_IDS = [
  7236717, 7236718, 7236719, 7236720, 7236721, 7236722, 7236723, 7236724, 7236725, 7236726, 7236727,
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const series = await Series.findOne({ tmdbId: TMDB_ID });
  if (!series) throw new Error("Series not found");

  const docs = await Episode.find({ seriesId: series._id, tmdbEpisodeId: { $in: REMAINING_TMDB_IDS } }).lean();
  console.log(`${docs.length} documents à corriger.`);

  for (const doc of docs) {
    const match = doc.title?.match(/Episode (\d+)/);
    if (!match) {
      console.log(`⚠️ Titre inattendu pour ${doc._id}: "${doc.title}" — ignoré.`);
      continue;
    }
    const realNumber = Number(match[1]);

    // Vérifie qu'aucun autre document n'occupe déjà ce numéro (sécurité anti-collision)
    const conflict = await Episode.findOne({
      seriesId: series._id,
      seasonNumber: doc.seasonNumber,
      episodeNumber: realNumber,
      _id: { $ne: doc._id },
    }).lean();

    if (conflict) {
      console.log(`⚠️ Collision détectée pour ep ${realNumber} avec ${conflict._id} — ignoré, à vérifier à la main.`);
      continue;
    }

    await Episode.updateOne({ _id: doc._id }, { $set: { episodeNumber: realNumber } });
    console.log(`Corrigé ${doc._id} → episodeNumber=${realNumber}.`);
  }

  const remaining = await Episode.countDocuments({ seriesId: series._id });
  console.log(`\n${remaining} épisodes en base (attendu : 1181, inchangé).`);

  await mongoose.disconnect();
  console.log("✅ Terminé.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
