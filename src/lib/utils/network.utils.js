/**
 * IDs TMDB des networks dont le logo NE DOIT PAS être inversé.
 * Par défaut, tous les logos sont inversés (filter: brightness(0) invert(1))
 * car ils sont généralement sombres et illisibles sur fond sombre.
 * Cette liste contient les exceptions : logos déjà clairs, ou avec
 * des couleurs caractéristiques qu'on veut préserver.
 */
const NO_INVERT_NETWORK_IDS = new Set([
  2, // ABC
]);

export const shouldInvertLogo = (networkId) => {
  return !NO_INVERT_NETWORK_IDS.has(networkId);
};
