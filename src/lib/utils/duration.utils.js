export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return null;
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
};

export const formatLongDuration = (minutes) => {
  if (!minutes || minutes <= 0) return null;
  if (minutes < 60) return `${minutes}min`;

  const totalHours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (totalHours < 24) {
    return remainingMinutes > 0 ? `${totalHours}h ${remainingMinutes}min` : `${totalHours}h`;
  }

  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (hours === 0) return `${days}d`;
  return `${days}d ${hours}h`;
};
