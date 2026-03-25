const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const getAllSeries = async () => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching all series:", error);
    return [];
  }
};

export const searchSeries = async (query, page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`,
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return {
      results: data.results,
      totalResults: data.total_results,
      totalPages: data.total_pages,
      currentPage: data.page,
    };
  } catch (error) {
    console.error("Error searching series:", error);
    return { results: [], totalResults: 0, totalPages: 0, currentPage: 1 };
  }
};

export const getSeriesDetails = async (seriesId) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/tv/${seriesId}?api_key=${TMDB_API_KEY}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching series details:", error);
    return null;
  }
};

export const getSeasonDetails = async (seriesId, seasonNumber) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/tv/${seriesId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`);
    if (!response.ok) throw new Error(`HTTP error! status! ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(`Error fetching season ${seasonNumber} details:`, err);
    return null;
  }
};

export const getAllSeasonsWithEpisodes = async (seriesId) => {
  try {
    const seriesDetails = await getSeriesDetails(seriesId);
    if (!seriesDetails) throw new Error("Serie not found");

    // Filte les saisons spéciales (notées 0 sur TMDB)
    const regularSeasons = seriesDetails.seasons.filter((s) => s.season_number > 0);

    const seasonsWithEpisodes = await Promise.all(
      regularSeasons.map((season) => getSeasonDetails(seriesId, season.season_number)),
    );
    return { seriesDetails, seasons: seasonsWithEpisodes.filter(Boolean) };
  } catch (err) {
    console.error("Error fetching all seasons:", err);
    return null;
  }
};
