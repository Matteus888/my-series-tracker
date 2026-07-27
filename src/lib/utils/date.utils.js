export function formatDate(dateStr, locale = "fr-FR") {
  if (!dateStr) return "Unknown";
  return new Date(dateStr).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formate une date avec le jour de la semaine.
 * @param {string} dateStr - date au format YYYY-MM-DD ou ISO
 * @returns {string} ex: "Monday, 14 April"
 */
export const formatWeekdayDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

/**
 * Formate une date en label lisible.
 * Today, Yesterday, puis "Lundi 14 avril" etc.
 * @param {string} dateStr - date au format YYYY-MM-DD ou ISO
 * @returns {string}
 */
export const formatDateLabel = (dateStr, { showTomorrow = true } = {}) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  if (showTomorrow && isSameDay(date, tomorrow)) return "Tomorrow";

  return date.toLocaleDateString("en-GB", {
    // weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
