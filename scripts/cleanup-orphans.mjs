// scripts/cleanup-orphans.mjs
import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";

const TMDB_ID = 37854;
const Episode = mongoose.model("Episode", new mongoose.Schema({}, { strict: false }), "episodes");
const Series = mongoose.model("Series", new mongoose.Schema({}, { strict: false }), "series");
const EpisodeProgress = mongoose.model(
  "EpisodeProgress",
  new mongoose.Schema({}, { strict: false }),
  "episodeprogresses",
);

const ORPHAN_TMDB_IDS = [
  7236716, 7236717, 7236718, 7236719, 7236720, 7236721, 7236722, 7236723, 7236724, 7236725, 7236726, 7236727,
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const series = await Series.findOne({ tmdbId: TMDB_ID });
  if (!series) throw new Error("Series not found");

  const orphans = await Episode.find({ seriesId: series._id, tmdbEpisodeId: { $in: ORPHAN_TMDB_IDS } }).lean();
  console.log(`${orphans.length} orphelins trouvés.`);

  for (const orphan of orphans) {
    const match = orphan.title?.match(/Episode (\d+)/);
    if (!match) {
      console.log(`⚠️ Titre inattendu pour ${orphan._id}: "${orphan.title}" — ignoré.`);
      continue;
    }
    const realNumber = Number(match[1]);

    const replacement = await Episode.findOne({
      seriesId: series._id,
      seasonNumber: orphan.seasonNumber,
      episodeNumber: realNumber,
      tmdbEpisodeId: { $ne: orphan.tmdbEpisodeId },
    }).lean();

    if (!replacement) {
      console.log(`⚠️ Pas de remplaçant trouvé pour ${orphan._id} (ep ${realNumber}) — ignoré.`);
      continue;
    }

    const orphanProgressList = await EpisodeProgress.find({ episodeId: orphan._id }).lean();

    for (const progress of orphanProgressList) {
      const existingOnReplacement = await EpisodeProgress.findOne({
        userId: progress.userId,
        episodeId: replacement._id,
      }).lean();

      if (existingOnReplacement) {
        // Le remplaçant a déjà un progress pour cet utilisateur — on garde celui-là,
        // on jette juste celui de l'orphelin (doublon logique du même visionnage)
        await EpisodeProgress.deleteOne({ _id: progress._id });
        console.log(
          `  userId=${progress.userId} : déjà un progress sur le remplaçant, orphelin ${progress._id} supprimé.`,
        );
      } else {
        await EpisodeProgress.updateOne({ _id: progress._id }, { $set: { episodeId: replacement._id } });
        console.log(`  userId=${progress.userId} : progress migré vers ${replacement._id}.`);
      }
    }

    await Episode.deleteOne({ _id: orphan._id });
    console.log(`Supprimé orphelin ${orphan._id} (ep ${realNumber}, remplaçant ${replacement._id}).`);
  }

  const remaining = await Episode.countDocuments({ seriesId: series._id });
  console.log(`\n${remaining} épisodes en base après nettoyage (attendu : 1181).`);

  await mongoose.disconnect();
  console.log("✅ Terminé.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
