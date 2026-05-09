const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const EXCLUDED_GENRE_IDS = [10763, 10764, 10767, 10766]; // news, reality, talk, soap
const EXCLUDED_GENRES_STRING = EXCLUDED_GENRE_IDS.join(",");

export const getAllSeries = async (page = 1, filters = {}) => {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      page,
      sort_by: "popularity.desc",
      without_genres: EXCLUDED_GENRES_STRING,
      ...filters,
    });

    if (filters["vote_count.gte"] === undefined) {
      params.set("vote_count.gte", 10);
    }

    if (filters.sort_by === "vote_average.desc" && filters["vote_count.gte"] === undefined) {
      params.set("vote_count.gte", 200);
    }

    const response = await fetch(`${TMDB_BASE_URL}/discover/tv?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return {
      results: data.results,
      totalResults: data.total_results,
      totalPages: data.total_pages,
      currentPage: data.page,
    };
  } catch (error) {
    console.error("Error fetching all series:", error);
    return { results: [], totalResults: 0, totalPages: 0, currentPage: 1 };
  }
};

export const searchSeries = async (query, page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`,
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    // Filtrer les genres exclus
    const filteredResults = data.results.filter(
      (serie) => !serie.genre_ids.some((id) => EXCLUDED_GENRE_IDS.includes(id)),
    );

    return {
      results: filteredResults,
      totalResults: data.total_results,
      totalPages: data.total_pages,
      currentPage: data.page,
    };
  } catch (error) {
    console.error("Error searching series:", error);
    return { results: [], totalResults: 0, totalPages: 0, currentPage: 1 };
  }
};

export const getTvGenres = async () => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.genres.filter((g) => !EXCLUDED_GENRE_IDS.includes(g.id));
  } catch (error) {
    console.error("Error fetching TV genres:", error);
    return [];
  }
};

export const getTrending = async (page = 1, timeWindow = "week") => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/trending/tv/${timeWindow}?api_key=${TMDB_API_KEY}&page=${page}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return {
      results: data.results.filter((s) => !s.genre_ids.some((id) => EXCLUDED_GENRE_IDS.includes(id))),
      totalResults: data.total_results,
      totalPages: data.total_pages,
      currentPage: data.page,
    };
  } catch (error) {
    console.error("Error fetching trending:", error);
    return { results: [], totalResults: 0, totalPages: 0, currentPage: 1 };
  }
};

export const getSeriesDetails = async (seriesId) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${seriesId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids,aggregate_credits`,
    );
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
  const seriesDetails = await getSeriesDetails(seriesId);
  if (!seriesDetails) return null;

  const regularSeasons = (seriesDetails.seasons ?? []).filter((s) => s.season_number > 0);

  const seasonsWithEpisodes = await Promise.all(
    regularSeasons.map((season) => getSeasonDetails(seriesId, season.season_number)),
  );

  return { seriesDetails, seasons: seasonsWithEpisodes.filter(Boolean) };
};

export async function getSeriesVideos(tmdbId) {
  const url = `${TMDB_BASE_URL}/tv/${tmdbId}/videos?api_key=${TMDB_API_KEY}&include_video_language=en,null`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}

export async function getSeasonVideos(tmdbId, seasonNumber) {
  const url = `${TMDB_BASE_URL}/tv/${tmdbId}/season/${seasonNumber}/videos?api_key=${TMDB_API_KEY}&include_video_language=en,null`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}

export const getEpisodeDetails = async (seriesId, seasonNumber, episodeNumber) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}` +
        `?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,external_ids,images`,
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error("Error fetching episode details:", err);
    return null;
  }
};

export const getPersonDetails = async (personId) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/person/${personId}?api_key=${TMDB_API_KEY}` +
        `&append_to_response=tv_credits,external_ids,images`,
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching person details:", error);
    return null;
  }
};
