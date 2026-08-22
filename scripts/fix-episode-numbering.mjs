import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_ID = 37854; // ⚠️ remplace par le vrai tmdbId de One Piece dans TA base
const OFFSET = -1;

const SeriesSchema = new mongoose.Schema({ tmdbId: Number }, { strict: false });
const EpisodeSchema = new mongoose.Schema(
  { seriesId: mongoose.Schema.Types.ObjectId, tmdbEpisodeId: Number, episodeNumber: Number },
  { strict: false },
);

// 3e argument = nom de collection explicite, pour éviter tout souci
// de pluralisation automatique de mongoose sur "Series"/"Episode"
const Series = mongoose.model("Series", SeriesSchema, "series");
const Episode = mongoose.model("Episode", EpisodeSchema, "episodes");

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
  if (!TMDB_API_KEY) throw new Error("Missing NEXT_PUBLIC_TMDB_API_KEY in .env.local");
  await mongoose.connect(process.env.MONGODB_URI);

  const series = await Series.findOne({ tmdbId: TMDB_ID });
  if (!series) throw new Error("Series not found in DB — vérifie TMDB_ID");

  const seasons = await getAllSeasonsWithEpisodes(TMDB_ID);

  const targets = [];
  for (const season of seasons) {
    for (const ep of season.episodes ?? []) {
      if (!ep.id) continue;
      targets.push({ tmdbEpisodeId: ep.id, target: ep.episode_number + OFFSET });
    }
  }
  console.log(`${targets.length} épisodes trouvés sur TMDB.`);

  // Passe 1 : négation (aucune collision possible)
  const negateOps = targets.map(({ tmdbEpisodeId }) => ({
    updateOne: {
      filter: { seriesId: series._id, tmdbEpisodeId },
      update: [{ $set: { episodeNumber: { $multiply: ["$episodeNumber", -1] } } }],
    },
  }));
  const r1 = await Episode.bulkWrite(negateOps, { ordered: true });
  console.log(`Passe 1 : ${r1.modifiedCount} modifiés.`);

  // Passe 2 : valeurs finales
  const finalOps = targets.map(({ tmdbEpisodeId, target }) => ({
    updateOne: {
      filter: { seriesId: series._id, tmdbEpisodeId },
      update: { $set: { episodeNumber: target } },
    },
  }));
  const r2 = await Episode.bulkWrite(finalOps, { ordered: true });
  console.log(`Passe 2 : ${r2.modifiedCount} modifiés.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
