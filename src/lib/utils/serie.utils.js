export const normalizeSerieData = (tracked) => {
  if (!tracked) return null;

  if (tracked.name !== undefined) return tracked;

  const seriesId = tracked.seriesId;
  const isPopulated = seriesId && typeof seriesId === "object" && seriesId.title;

  if (isPopulated) {
    return {
      id: seriesId.tmdbId,
      name: seriesId.title,
      poster_path: seriesId.posterPath,
      backdrop_path: seriesId.backdropPath,
      overview: seriesId.overview,
      first_air_date: seriesId.firstAirDate,
      vote_average: seriesId.voteAverage,
      vote_count: seriesId.voteCount,
    };
  }
  return null;
};
