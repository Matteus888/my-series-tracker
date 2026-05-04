/**
 * Formate une liste d'épisodes en label compact.
 *
 * @param {Array<{episodeNumber: number}>} episodes - Liste triée par episodeNumber
 * @returns {string}
 *
 * @example
 *   formatEpisodeLabel([{episodeNumber: 5}])
 *   // → "E05"
 *
 *   formatEpisodeLabel([{episodeNumber: 1}, {episodeNumber: 2}, {episodeNumber: 3}])
 *   // → "E01-03"
 *
 *   formatEpisodeLabel([{episodeNumber: 1}, {episodeNumber: 3}, {episodeNumber: 5}])
 *   // → "E01, E03, E05"
 */
export const formatEpisodeLabel = (episodes) => {
  if (!episodes?.length) return "";

  if (episodes.length === 1) {
    return `E${String(episodes[0].episodeNumber).padStart(2, "0")}`;
  }

  const numbers = episodes.map((e) => e.episodeNumber);
  const isContiguous = numbers.every((n, i) => i === 0 || n === numbers[i - 1] + 1);

  if (isContiguous) {
    const first = String(numbers[0]).padStart(2, "0");
    const last = String(numbers[numbers.length - 1]).padStart(2, "0");
    return `E${first}-${last}`;
  }

  return numbers.map((n) => `E${String(n).padStart(2, "0")}`).join(", ");
};
