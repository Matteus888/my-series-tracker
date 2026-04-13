import { useState, useMemo } from "react";

export const useDisplayOrder = (results) => {
  const [order, setOrder] = useState("default");

  const sortedResults = useMemo(() => {
    switch (order) {
      case "name_asc":
        return [...results].sort((a, b) => a.name.localeCompare(b.name));
      case "name_desc":
        return [...results].sort((a, b) => b.name.localeCompare(a.name));
      case "date_desc":
        return [...results].sort((a, b) => new Date(b.first_air_date) - new Date(a.first_air_date));
      case "date_asc":
        return [...results].sort((a, b) => new Date(a.first_air_date) - new Date(b.first_air_date));
      case "rating_desc":
        return [...results].sort((a, b) => b.vote_average - a.vote_average);
      case "rating_asc":
        return [...results].sort((a, b) => a.vote_average - b.vote_average);
      default:
        return results;
    }
  }, [results, order]);

  return { order, setOrder, sortedResults };
};
