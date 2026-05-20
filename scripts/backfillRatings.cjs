require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const mongoose = require("mongoose");

const { MONGODB_URI, OMDB_API_KEY, TRAKT_CLIENT_ID } = process.env;

if (!MONGODB_URI) {
  console.error("✗ MONGODB_URI manquant dans .env.local");
  process.exit(1);
}
// --- OMDb ---
const getOmdbRatings = async (imdbId) => {
  if (!imdbId || !OMDB_API_KEY) return null;
  try {
    const res = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.Response === "False") return null;
    const ratings = {};
    (data.Ratings || []).forEach((r) => {
      if (r.Source === "Internet Movie Database") {
        ratings.imdb = {
          score: parseFloat(r.Value.split("/")[0]),
          voteCount: parseInt((data.imdbVotes || "0").replace(/,/g, ""), 10) || 0,
        };
      } else if (r.Source === "Rotten Tomatoes") {
        const s = parseInt(r.Value.replace("%", ""), 10);
        if (!Number.isNaN(s)) ratings.rottenTomatoes = { score: s };
      } else if (r.Source === "Metacritic") {
        const s = parseInt(r.Value.split("/")[0], 10);
        if (!Number.isNaN(s)) ratings.metacritic = { score: s };
      }
    });
    if (!ratings.metacritic && data.Metascore && data.Metascore !== "N/A") {
      const s = parseInt(data.Metascore, 10);
      if (!Number.isNaN(s)) ratings.metacritic = { score: s };
    }
    return ratings;
  } catch (err) {
    console.error("OMDb error:", err.message);
    return null;
  }
};

// --- Trakt ---
const getTraktRatings = async (imdbId) => {
  if (!imdbId || !TRAKT_CLIENT_ID) return null;
  try {
    const res = await fetch(`https://api.trakt.tv/shows/${imdbId}/ratings`, {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": TRAKT_CLIENT_ID,
        "User-Agent": "MySeriesTracker/1.0",
      },
    });
    if (!res.ok) {
      if (res.status !== 404) console.warn(`  Trakt ${imdbId}: HTTP ${res.status}`);
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

// --- Main ---
(async () => {
  await mongoose.connect(MONGODB_URI);

  // On parle directement à la collection Mongo, sans passer par les modèles Mongoose.
  // Ça évite tous les imports de l'app Next.
  const Series = mongoose.connection.collection("series");

  const all = await Series.find({ imdbId: { $ne: null, $exists: true } })
    .project({ _id: 1, imdbId: 1, title: 1 })
    .toArray();

  let ok = 0;
  let skip = 0;

  for (const s of all) {
    const [omdb, trakt] = await Promise.all([getOmdbRatings(s.imdbId), getTraktRatings(s.imdbId)]);

    const set = { "ratings.lastFetched": new Date() };
    if (omdb?.imdb) {
      set["ratings.imdb.score"] = omdb.imdb.score;
      set["ratings.imdb.voteCount"] = omdb.imdb.voteCount;
    }
    if (omdb?.rottenTomatoes) set["ratings.rottenTomatoes.score"] = omdb.rottenTomatoes.score;
    if (omdb?.metacritic) set["ratings.metacritic.score"] = omdb.metacritic.score;
    if (trakt) {
      set["ratings.trakt.score"] = trakt.score;
      set["ratings.trakt.voteCount"] = trakt.voteCount;
    }

    const sources = [];
    if (omdb?.imdb) sources.push("IMDb");
    if (omdb?.rottenTomatoes) sources.push("RT");
    if (omdb?.metacritic) sources.push("MC");
    if (trakt) sources.push("Trakt");

    if (sources.length === 0) {
      skip++;
    } else {
      await Series.updateOne({ _id: s._id }, { $set: set });
      ok++;
    }

    await new Promise((r) => setTimeout(r, 250)); // throttle léger
  }

  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
