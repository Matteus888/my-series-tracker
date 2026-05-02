/**
 * Calcule un score de pertinence pour trier les résultats de recherche.
 * Plus le score est élevé, plus le résultat est pertinent.
 *
 * Logique de scoring :
 *  - 1000 : titre commence par la query exacte
 *  -  500 : titre contient la query exacte (en sous-chaîne)
 *  -  200 : tous les mots présents dans l'ordre tapé
 *  -  100 : tous les mots présents dans le désordre
 *  -    0 : aucun mot ne matche
 *
 * Bonus :
 *  - +50  si la query matche un mot complet (entouré d'espaces ou bord)
 *  - +0..30 selon la position du match (plus c'est tôt, mieux c'est)
 *  - +0..20 selon la popularité (vote_count) en départage final
 */
export const computeSearchScore = (title, query, voteCount = 0) => {
  if (!title || !query) return 0;

  const t = title.toLowerCase().trim();
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  let score = 0;

  // 1. Match exact en début de titre
  if (t.startsWith(q)) {
    score += 1000;
  }
  // 2. Sous-chaîne exacte n'importe où
  else if (t.includes(q)) {
    score += 500;
    // Bonus si c'est un mot complet (bord ou espace de chaque côté)
    const wordBoundaryRegex = new RegExp(`(^|\\s)${escapeRegex(q)}($|\\s)`);
    if (wordBoundaryRegex.test(t)) score += 50;
  }
  // 3. Mots présents dans l'ordre tapé (mais pas contigus)
  else {
    const words = q.split(/\s+/).filter(Boolean);
    const allInOrder = wordsInOrder(t, words);
    const allPresent = words.every((w) => t.includes(w));

    if (allInOrder) {
      score += 200;
    } else if (allPresent) {
      score += 100;
    }
  }

  // Bonus position : plus le match est tôt dans le titre, mieux c'est
  if (score > 0) {
    const idx = t.indexOf(q);
    if (idx >= 0) {
      score += Math.max(0, 30 - idx);
    }
  }

  // Tie-breaker très léger : popularité (max 20 points)
  // pour départager deux titres au même niveau de pertinence
  score += Math.min(20, Math.log10((voteCount || 0) + 1) * 4);

  return score;
};

/**
 * Trie un tableau de séries par pertinence par rapport à une query.
 */
export const sortByRelevance = (series, query) => {
  if (!query?.trim()) return series;

  return [...series]
    .map((s) => ({ ...s, _score: computeSearchScore(s.name, query, s.vote_count) }))
    .sort((a, b) => b._score - a._score);
};

// --- helpers ---

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const wordsInOrder = (text, words) => {
  let cursor = 0;
  for (const w of words) {
    const idx = text.indexOf(w, cursor);
    if (idx === -1) return false;
    cursor = idx + w.length;
  }
  return true;
};
