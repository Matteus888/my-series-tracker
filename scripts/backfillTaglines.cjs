require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const mongoose = require("mongoose");

const { MONGODB_URI, NEXT_PUBLIC_TMDB_API_KEY } = process.env;

if (!MONGODB_URI) {
  console.error("✗ MONGODB_URI manquant");
  process.exit(1);
}
if (!NEXT_PUBLIC_TMDB_API_KEY) {
  console.error("✗ TMDB_API_KEY manquant");
  process.exit(1);
}

const getTmdbTagline = async (tmdbId) => {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${NEXT_PUBLIC_TMDB_API_KEY}&language=en-US`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.tagline || null;
  } catch (err) {
    console.error(`TMDB error for ${tmdbId}:`, err.message);
    return null;
  }
};

(async () => {
  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB:", mongoose.connection.db.databaseName);

  const Series = mongoose.connection.collection("series");

  const all = await Series.find({
    $or: [{ tagline: { $exists: false } }, { tagline: null }, { tagline: "" }],
  })
    .project({ _id: 1, tmdbId: 1, title: 1 })
    .toArray();

  console.log(`Found ${all.length} series without tagline\n`);

  let ok = 0;
  let empty = 0;

  for (const s of all) {
    const tagline = await getTmdbTagline(s.tmdbId);
    await Series.updateOne({ _id: s._id }, { $set: { tagline: tagline || null } });

    if (tagline) {
      console.log(`  ✓ ${s.title}: "${tagline}"`);
      ok++;
    } else {
      console.log(`  - ${s.title}: pas de tagline`);
      empty++;
    }

    await new Promise((r) => setTimeout(r, 100)); // throttle léger TMDB
  }

  console.log(`\n✓ Done. ${ok} avec tagline, ${empty} sans`);
  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
