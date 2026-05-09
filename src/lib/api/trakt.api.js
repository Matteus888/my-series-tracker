const TRAKT_API_KEY = process.env.TRAKT_CLIENT_ID;
const TRAKT_BASE_URL = "https://api.trakt.tv";

/**
 * Récupère la note Trakt d'une série via son IMDB ID.
 * Trakt accepte directement les IDs IMDB en remplacement de son slug.
 * Doc : https://trakt.docs.apiary.io/#reference/shows/ratings
 */
export const getTraktRatings = async (imdbId) => {
  if (!imdbId || !TRAKT_API_KEY) return null;

  try {
    const response = await fetch(`${TRAKT_BASE_URL}/shows/${imdbId}/ratings`, {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": TRAKT_API_KEY,
        "User-Agent": "MySeriesTracker/1.0",
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null; // série inconnue de Trakt
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (typeof data.rating !== "number") return null;

    return {
      score: Math.round(data.rating * 10) / 10, // sur 10, arrondi 1 décimale
      voteCount: data.votes ?? 0,
    };
  } catch (err) {
    console.error("Error fetching Trakt ratings:", err.message);
    return null;
  }
};

/**
 * Récupère la note Trakt d'un épisode via les IDs IMDB de la série + saison + numéro.
 * Doc : https://trakt.docs.apiary.io/#reference/episodes/ratings
 */
export const getTraktEpisodeRating = async (showImdbId, seasonNumber, episodeNumber) => {
  if (!showImdbId || !TRAKT_API_KEY || seasonNumber == null || episodeNumber == null) return null;

  try {
    const url = `${TRAKT_BASE_URL}/shows/${showImdbId}/seasons/${seasonNumber}/episodes/${episodeNumber}/ratings`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": TRAKT_API_KEY,
        "User-Agent": "MySeriesTracker/1.0",
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      console.error(`Trakt episode ${response.status} for ${showImdbId} S${seasonNumber}E${episodeNumber}`);
      return null;
    }

    const data = await response.json();
    if (typeof data.rating !== "number") return null;

    return {
      score: Math.round(data.rating * 10) / 10,
      voteCount: data.votes ?? 0,
    };
  } catch (err) {
    console.error("Error fetching Trakt episode ratings:", err.message);
    return null;
  }
};
