/**
 * Normalise chaque source sur 0-100 et renvoie la moyenne arrondie.
 * Sources prises en compte : tmdb, imdb, rottenTomatoes, metacritic, trakt.
 */
export const computeAverageScore = (ratings) => {
  if (!ratings) return null;

  const scores = [];

  if (ratings?.tmdb?.score) scores.push((ratings.tmdb.score / 10) * 100);
  if (ratings?.imdb?.score) scores.push((ratings.imdb.score / 10) * 100);
  if (ratings.rottenTomatoes?.score) scores.push(ratings.rottenTomatoes.score);
  if (ratings.metacritic?.score) scores.push(ratings.metacritic.score);
  if (ratings.trakt?.score) scores.push((ratings.trakt.score / 10) * 100);

  if (scores.length === 0) return null;

  return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
};
