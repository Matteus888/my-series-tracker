/**
 * Migration : enrichit les networks des séries existantes avec leur homepage.
 *
 * Stratégie :
 * 1. Construit un cache global { networkId → homepage } en fetchant TMDB une fois par network unique
 * 2. Met à jour toutes les séries qui ont des networks sans homepage
 *
 * Idempotent : peut être relancé, ne refetch que ce qui manque.
 * Usage : npm run migrate:networks
 */

import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Charge .env.local en priorité (convention Next.js), puis .env en fallback.
// DOIT être fait avant tout autre import qui lit process.env.
config({ path: path.resolve(__dirname, "../.env.local") });
config({ path: path.resolve(__dirname, "../.env") });

// Imports dynamiques : forcent l'évaluation APRÈS le chargement de dotenv.
const { default: mongoose } = await import("mongoose");
const { Series } = await import("@/models/series.model");
const { getNetworkDetails } = await import("@/lib/api/tmdb.api");
const { default: dbConnect } = await import("@/lib/db/db.connect");

const TMDB_DELAY_MS = 50; // ~20 req/s, large marge sous le rate limit TMDB

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const migrate = async () => {
  await dbConnect();

  // 1. Récupère tous les networks distincts présents en base
  const distinctNetworks = await Series.aggregate([
    { $unwind: "$networks" },
    {
      $group: {
        _id: "$networks.id",
        name: { $first: "$networks.name" },
        // récupère une homepage déjà connue si elle existe
        knownHomepage: {
          $max: {
            $cond: [
              { $and: [{ $ne: ["$networks.homepage", null] }, { $ne: ["$networks.homepage", ""] }] },
              "$networks.homepage",
              null,
            ],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 2. Build du cache : pour chaque network, soit on a déjà la homepage, soit on fetch TMDB
  const homepageMap = new Map();
  let fetched = 0;
  let skipped = 0;
  let failed = 0;

  for (const net of distinctNetworks) {
    if (net.knownHomepage) {
      homepageMap.set(net._id, net.knownHomepage);
      skipped++;
      continue;
    }

    try {
      const details = await getNetworkDetails(net._id);
      const homepage = details?.homepage?.trim() || null;
      if (homepage) {
        homepageMap.set(net._id, homepage);
        fetched++;
      } else {
        failed++;
      }
    } catch (err) {
      failed++;
      console.error(`  ✗ [${net._id}] ${net.name} → ${err.message}`);
    }

    await sleep(TMDB_DELAY_MS);
  }

  if (homepageMap.size === 0) {
    await mongoose.disconnect();
    return;
  }

  // 3. Met à jour les séries : pour chaque network avec homepage connue, set la homepage
  let totalUpdated = 0;
  for (const [networkId, homepage] of homepageMap) {
    const result = await Series.updateMany(
      {
        networks: {
          $elemMatch: {
            id: networkId,
            $or: [{ homepage: { $exists: false } }, { homepage: null }, { homepage: "" }],
          },
        },
      },
      { $set: { "networks.$[elem].homepage": homepage } },
      { arrayFilters: [{ "elem.id": networkId }] },
    );

    if (result.modifiedCount > 0) {
      totalUpdated += result.modifiedCount;
    }
  }

  await mongoose.disconnect();
};

migrate().catch((err) => {
  console.error("✗ Migration échouée :", err);
  process.exit(1);
});
