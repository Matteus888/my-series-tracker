export const computeAverageScore = (ratings) => {
  const scores = [];

  if (ratings?.tmdb?.score) scores.push((ratings.tmdb.score / 10) * 100);
  if (ratings?.imdb?.score) scores.push((ratings.imdb.score / 10) * 100);

  if (scores.length === 0) return null;

  return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
};
