require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const mongoose = require("mongoose");

const { MONGODB_URI, TRAKT_CLIENT_ID } = process.env;

if (!MONGODB_URI) {
  console.error("✗ MONGODB_URI manquant dans .env.local");
  process.exit(1);
}
if (!TRAKT_CLIENT_ID) {
  console.error("✗ TRAKT_CLIENT_ID manquant");
  process.exit(1);
}

const getTraktEpisodeRating = async (showImdbId, season, episode) => {
  if (!showImdbId) return null;
  try {
    const url = `https://api.trakt.tv/shows/${showImdbId}/seasons/${season}/episodes/${episode}/ratings`;
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": TRAKT_CLIENT_ID,
        "User-Agent": "MySeriesTracker/1.0",
      },
    });
    if (!res.ok) {
      if (res.status !== 404) console.warn(`  Trakt ${showImdbId} S${season}E${episode}: HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    if (typeof data.rating !== "number") return null;
    return { score: Math.round(data.rating * 10) / 10, voteCount: data.votes || 0 };
  } catch (err) {
    console.error("Trakt error:", err.message);
    return null;
  }
};

(async () => {
  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB:", mongoose.connection.db.databaseName);

  const SeriesCol = mongoose.connection.collection("series");
  const EpisodesCol = mongoose.connection.collection("episodes");

  // Toutes les séries avec un imdbId
  const seriesList = await SeriesCol.find({ imdbId: { $ne: null, $exists: true } })
    .project({ _id: 1, imdbId: 1, title: 1 })
    .toArray();

  console.log(`Found ${seriesList.length} series\n`);

  // Date d'aujourd'hui pour ne traiter que les épisodes diffusés
  const now = new Date();

  let totalOk = 0;
  let totalSkip = 0;

  for (const series of seriesList) {
    // Tous les épisodes diffusés de cette série, qui n'ont PAS de note Trakt fetched récente
    const episodes = await EpisodesCol.find({
      seriesId: series._id,
      airDate: { $lte: now, $ne: null },
      $or: [{ "ratings.trakt.fetchedAt": { $exists: false } }, { "ratings.trakt.fetchedAt": null }],
    })
      .project({ _id: 1, seasonNumber: 1, episodeNumber: 1 })
      .sort({ seasonNumber: 1, episodeNumber: 1 })
      .toArray();

    if (episodes.length === 0) {
      console.log(`  ${series.title}: rien à faire`);
      continue;
    }

    console.log(`\n→ ${series.title} (${episodes.length} épisodes)`);
    let ok = 0;
    let skip = 0;

    for (const ep of episodes) {
      const rating = await getTraktEpisodeRating(series.imdbId, ep.seasonNumber, ep.episodeNumber);

      await EpisodesCol.updateOne(
        { _id: ep._id },
        {
          $set: {
            "ratings.trakt.score": rating?.score ?? null,
            "ratings.trakt.voteCount": rating?.voteCount ?? 0,
            "ratings.trakt.fetchedAt": new Date(),
          },
        },
      );

      if (rating) ok++;
      else skip++;

      await new Promise((r) => setTimeout(r, 300)); // throttle Trakt
    }

    console.log(`  ✓ ${ok} avec note, ${skip} sans`);
    totalOk += ok;
    totalSkip += skip;
  }

  console.log(`\n✓ Done. Updated ${totalOk + totalSkip} épisodes (${totalOk} avec note Trakt)`);
  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
