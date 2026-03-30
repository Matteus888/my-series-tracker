export const RESULTS_VARIANTS = {
  search: ({ totalResults, query, styles }) => (
    <>
      We found <span className={styles.bold}>{totalResults}</span> results for &quot;{" "}
      <span className={styles.bold}>{query}</span> &quot;.
    </>
  ),
  allSeries: ({ totalResults, styles }) => (
    <>
      We&apos;ve listed <span className={styles.bold}>{totalResults}</span> existing series.
    </>
  ),
};
