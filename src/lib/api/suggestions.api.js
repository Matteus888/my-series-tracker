import dbConnect from "@/lib/db/db.connect";
import { getRecommendations } from "./tmdb.api";

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h
const MAX_SUGGESTIONS = 20;
const MAX_SEED_SERIES = 5; // nb de séries de référence pour fetch les reco

/**
 * Sélectionne les "seed series" : les séries préférées de l'user
 * Priorité : favorites → rating user élevé → completed/watching récents
 */
const pickSeedSeries = (trackedSeries) => {
  const scored = trackedSeries
    .filter((t) => t.tmdbId)
    .map((t) => {
      let score = 0;
      if (t.isFavorite) score += 10;
      if (t.rating) score += t.rating; // 1-10
      if (t.status === "completed") score += 3;
      if (t.status === "watching") score += 2;
      if (t.status === "plan_to_watch") score -= 2;
      if (t.status === "dropped") score -= 5;
      return { tmdbId: t.tmdbId, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, MAX_SEED_SERIES).map((s) => s.tmdbId);
};

/**
 * Génère les suggestions à partir des TMDB recommendations
 * pour les séries préférées du user.
 */
const generateSuggestions = async (trackedSeries) => {
  if (!trackedSeries?.length) return [];

  const seedIds = pickSeedSeries(trackedSeries);
  if (seedIds.length === 0) return [];

  // Set d'exclusion : toutes les séries déjà trackées
  const excludeIds = new Set(trackedSeries.map((t) => Number(t.tmdbId)));

  // Fetch en parallèle les reco pour chaque seed
  const recoLists = await Promise.all(seedIds.map((id) => getRecommendations(id)));

  // Agrégation : compte le nombre d'apparitions de chaque série dans les reco
  const candidateMap = new Map(); // tmdbId -> { serie, count, sumVoteAvg }

  recoLists.forEach((recos) => {
    recos.forEach((serie) => {
      if (excludeIds.has(serie.id)) return;

      const existing = candidateMap.get(serie.id);
      if (existing) {
        existing.count += 1;
      } else {
        candidateMap.set(serie.id, {
          serie,
          count: 1,
        });
      }
    });
  });

  // Scoring : apparitions multiples + qualité TMDB + popularité
  const scored = Array.from(candidateMap.values()).map(({ serie, count }) => {
    const voteAvg = serie.vote_average ?? 0;
    const voteCount = serie.vote_count ?? 0;
    const popularityBonus = voteCount > 1000 ? 1 : voteCount > 200 ? 0.5 : 0;
    const score = count * 3 + voteAvg * 0.5 + popularityBonus;
    return { serie, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, MAX_SUGGESTIONS).map((s) => s.serie);
};

/**
 * Renvoie les suggestions pour un user, avec cache 24h.
 * @returns {Promise<Array>} Tableau de séries au format TMDB brut
 */
export const getSuggestions = async (UserModel, userId) => {
  await dbConnect();

  const user = await UserModel.findById(userId).select("trackedSeries suggestionsCache").lean();
  if (!user) throw new Error("User not found");

  // Cache hit
  const cache = user.suggestionsCache;
  if (cache?.items && cache.generatedAt) {
    const age = Date.now() - new Date(cache.generatedAt).getTime();
    if (age < CACHE_TTL) return cache.items;
  }

  // Cache miss → génération
  const suggestions = await generateSuggestions(user.trackedSeries ?? []);

  // Sauvegarde du cache (fire & forget)
  UserModel.findByIdAndUpdate(userId, {
    suggestionsCache: { items: suggestions, generatedAt: new Date() },
  }).catch((err) => console.error("Failed to save suggestions cache:", err));

  return suggestions;
};

/**
 * Invalide le cache. À appeler quand l'user add/remove/update une série.
 */
export const invalidateSuggestionsCache = async (UserModel, userId) => {
  await dbConnect();
  await UserModel.findByIdAndUpdate(userId, {
    "suggestionsCache.items": null,
    "suggestionsCache.generatedAt": null,
  });
};
