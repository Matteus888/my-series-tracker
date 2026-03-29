const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = "https://www.omdbapi.com";

export const getOmdbRatings = async (imdbId) => {
  if (!imdbId) return null;

  try {
    const response = await fetch(`${OMDB_BASE_URL}/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    if (data.Response === "False") return null;

    const ratings = {};
    data.Ratings?.forEach((r) => {
      if (r.Source === "Internet Movie Database") {
        ratings.imdb = {
          score: parseFloat(r.Value.split("/")[0]),
          voteCount: parseInt(data.imdbVotes?.replace(/,/g, "") || "0"),
        };
      }
    });

    return ratings;
  } catch (err) {
    console.error("Error fetching OMDB ratings:", error);
    return null;
  }
};
