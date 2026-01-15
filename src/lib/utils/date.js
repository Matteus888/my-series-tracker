export function formatDate(dateStr, locale = "fr-FR") {
  if (!dateStr) return "Unknown";
  return new Date(dateStr).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
