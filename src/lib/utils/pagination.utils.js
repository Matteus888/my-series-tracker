const UI_PAGE_SIZE = 36;
const TMDB_PAGE_SIZE = 20;

export const getTmdbPagesForUiPage = (uiPage) => {
  const startIndex = (uiPage - 1) * UI_PAGE_SIZE;
  const endIndex = startIndex + UI_PAGE_SIZE;

  const startTmdbPage = Math.floor(startIndex / TMDB_PAGE_SIZE) + 1;
  const endTmdbPage = Math.floor((endIndex - 1) / TMDB_PAGE_SIZE) + 1;

  return { startIndex, startTmdbPage, endTmdbPage };
};

export const sliceResultsForUiPage = (results, startIndex) => {
  const offset = startIndex % TMDB_PAGE_SIZE;
  return results.slice(offset, offset + UI_PAGE_SIZE);
};

export const calcTotalUiPages = (totalTmdbResults) => {
  return Math.ceil(totalTmdbResults / UI_PAGE_SIZE);
};
