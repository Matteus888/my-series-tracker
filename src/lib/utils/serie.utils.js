import { computeAverageScore } from "./ratings.utils";

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
      score: computeAverageScore(seriesId.ratings),
      ratings: seriesId.ratings,
    };
  }
  return null;
};

export const EXCLUDED_GENRE_IDS = [10763, 10764, 10767, 10766]; // news, reality, talk, soap

const AWARD_SHOW_NAME_REGEX =
  /\b(oscars?|academy awards?|emmys?|grammys?|golden globes?|baftas?|sag awards?|tony awards?|mtv (movie |video music )?awards?|billboard music awards?|people'?s choice|critics'? choice|met gala|cannes|césars?|brit awards?)\b/i;

export const isAwardShow = (serie) =>
  AWARD_SHOW_NAME_REGEX.test(serie?.name ?? "") || AWARD_SHOW_NAME_REGEX.test(serie?.original_name ?? "");

export const hasExcludedGenre = (serie) => serie?.genre_ids?.some((id) => EXCLUDED_GENRE_IDS.includes(id)) ?? false;

export const shouldExcludeSerie = (serie) => hasExcludedGenre(serie) || isAwardShow(serie);
