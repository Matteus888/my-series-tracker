/**
 * Calcule le vrai timestamp UTC de diffusion d'un épisode à partir
 * de l'air_date TMDB (date sèche) et des networks de la série.
 *
 * TMDB stocke air_date comme une date calendaire dans le pays d'origine,
 * sans heure ni fuseau. Pour les plateformes de streaming US, cette date
 * correspond en réalité à une sortie à minuit PT / 21h ET, ce qui tombe
 * le lendemain en Europe. On corrige ici pour stocker le vrai moment de
 * disponibilité mondiale.
 */

// Map : TMDB network id → { dayOffset, hourUTC, label }
// hourUTC = heure UTC réelle de mise à disposition mondiale
// dayOffset = décalage en jours par rapport à l'air_date TMDB
//   (0 = même jour, 1 = lendemain)
//
// La règle : TMDB stocke la date US. Si la sortie tombe le lendemain en UTC,
// on utilise dayOffset=1 et l'heure UTC correspondante.
const NETWORK_RELEASE_MAP = {
  // --- Streamers US ---
  // Netflix : 00h PT (= 08h UTC hiver, 07h UTC été) -> même jour UTC
  213: { dayOffset: 0, hourUTC: 8, label: "Netflix" },
  // Disney+ (Marvel) : souvent 18h PT / 21h ET = 01h UTC lendemain
  2739: { dayOffset: 1, hourUTC: 1, label: "Disney+" },
  // Apple TV+ : 00h PT
  2552: { dayOffset: 0, hourUTC: 8, label: "Apple TV+" },
  // Amazon Prime Video : 00h PT
  1024: { dayOffset: 0, hourUTC: 8, label: "Amazon Prime Video" },
  // Paramount+ : souvent 00h ET le jour dit -> 05h UTC
  2703: { dayOffset: 0, hourUTC: 5, label: "Paramount+" },
  // Hulu : 00h ET = 05h UTC (date TMDB = date US)
  453: { dayOffset: 0, hourUTC: 5, label: "Hulu" },
  // HBO Max / Max : 21h ET = 02h UTC lendemain (en été)
  49: { dayOffset: 1, hourUTC: 2, label: "HBO" },
  3186: { dayOffset: 1, hourUTC: 2, label: "HBO Max / Max" },
  // Peacock : 00h ET = 05h UTC
  3353: { dayOffset: 0, hourUTC: 5, label: "Peacock" },
  // Broadcast US (prime time ~20-21h ET = 01-02h UTC lendemain)
  2243: { dayOffset: 1, hourUTC: 1, label: "The CW" },
  6: { dayOffset: 1, hourUTC: 1, label: "NBC" },
  2: { dayOffset: 1, hourUTC: 1, label: "ABC" },
  16: { dayOffset: 1, hourUTC: 1, label: "CBS" },
  19: { dayOffset: 1, hourUTC: 1, label: "FOX" },
  67: { dayOffset: 1, hourUTC: 2, label: "Showtime" },
  318: { dayOffset: 1, hourUTC: 2, label: "Starz" },
  174: { dayOffset: 1, hourUTC: 2, label: "AMC" },
  202: { dayOffset: 1, hourUTC: 2, label: "AMC+" },
  88: { dayOffset: 1, hourUTC: 1, label: "FX" },

  // --- UK (soir UK, reste sur le même jour UTC) ---
  4: { dayOffset: 0, hourUTC: 20, label: "BBC One" },
  332: { dayOffset: 0, hourUTC: 20, label: "BBC Two" },
  3324: { dayOffset: 0, hourUTC: 20, label: "BBC Three" },
  214: { dayOffset: 0, hourUTC: 20, label: "ITV" },
  99: { dayOffset: 0, hourUTC: 20, label: "Channel 4" },

  // --- France ---
  1: { dayOffset: 0, hourUTC: 19, label: "France 2" },
  47: { dayOffset: 0, hourUTC: 19, label: "Canal+" },
  2735: { dayOffset: 0, hourUTC: 19, label: "France.tv" },
};

// Default = minuit UTC du jour TMDB (= comportement actuel, pas de régression)
const DEFAULT_RELEASE = { dayOffset: 0, hourUTC: 0, label: "default" };

/**
 * @param {string|null} airDateStr - "YYYY-MM-DD" depuis TMDB
 * @param {Array<{id:number,name:string}>} networks
 * @returns {Date|null} timestamp UTC du vrai moment de diffusion mondiale
 */
export const computeAirDateTime = (airDateStr, networks = []) => {
  if (!airDateStr) return null;

  // Extrait YYYY-MM-DD au cas où c'est déjà une date ISO complète
  const dateOnly = String(airDateStr).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return null;

  // Trouve le premier network connu dans notre map
  let release = DEFAULT_RELEASE;
  for (const n of networks) {
    if (NETWORK_RELEASE_MAP[n?.id]) {
      release = NETWORK_RELEASE_MAP[n.id];
      break;
    }
  }

  // Construit le timestamp UTC : jour TMDB (+ dayOffset) à l'heure UTC du network
  const base = new Date(`${dateOnly}T00:00:00.000Z`);
  base.setUTCDate(base.getUTCDate() + release.dayOffset);
  base.setUTCHours(release.hourUTC, 0, 0, 0);
  return base;
};
