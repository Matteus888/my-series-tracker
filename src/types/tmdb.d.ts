export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbSerie {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  genres: TmdbGenre[];
  first_air_date: string;
  number_of_seasons: number;
  status: "Returning Series" | "Ended" | "Canceled" | "In Production" | "Planned";
}

export interface TmdbSerieSearchResult {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  popularity: number;
}

export interface TmdbSearchResponse {
  page: number;
  results: TmdbSerieSearchResult[];
  total_pages: number;
  total_results: number;
}
