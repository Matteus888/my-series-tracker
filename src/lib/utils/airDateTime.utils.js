// Map TMDB network id → { dayOffset, hourUTC, label }
// hourUTC = heure UTC réelle de mise à disposition mondiale
// dayOffset = décalage en jours par rapport à l'air_date TMDB
const NETWORK_RELEASE_MAP = {
  // Streamers US
  213: { dayOffset: 0, hourUTC: 8, label: "Netflix" },
  2739: { dayOffset: 1, hourUTC: 1, label: "Disney+" },
  2552: { dayOffset: 1, hourUTC: 1, label: "Apple TV+" },
  1024: { dayOffset: 0, hourUTC: 8, label: "Amazon Prime Video" },
  2703: { dayOffset: 0, hourUTC: 5, label: "Paramount+" },
  453: { dayOffset: 0, hourUTC: 5, label: "Hulu" },
  49: { dayOffset: 1, hourUTC: 2, label: "HBO" },
  3186: { dayOffset: 1, hourUTC: 2, label: "HBO Max / Max" },
  3353: { dayOffset: 0, hourUTC: 5, label: "Peacock" },

  // Broadcast US
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

  // UK
  4: { dayOffset: 0, hourUTC: 20, label: "BBC One" },
  332: { dayOffset: 0, hourUTC: 20, label: "BBC Two" },
  3324: { dayOffset: 0, hourUTC: 20, label: "BBC Three" },
  214: { dayOffset: 0, hourUTC: 20, label: "ITV" },
  99: { dayOffset: 0, hourUTC: 20, label: "Channel 4" },

  // France
  1: { dayOffset: 0, hourUTC: 19, label: "France 2" },
  47: { dayOffset: 0, hourUTC: 19, label: "Canal+" },
  2735: { dayOffset: 0, hourUTC: 19, label: "France.tv" },
};

const DEFAULT_RELEASE = { dayOffset: 0, hourUTC: 0, label: "default" };

/**
 * @param {string|null} airDateStr - "YYYY-MM-DD" depuis TMDB
 * @param {Array<{id:number,name:string}>} networks
 * @param {Object} [options]
 * @param {{dayOffset:number, hourUTC:number}} [options.override] - override par série
 * @param {string} [options.tmdbAirTime] - "HH:MM" depuis TMDB si dispo
 * @returns {Date|null}
 */
export const computeAirDateTime = (airDateStr, networks = [], options = {}) => {
  if (!airDateStr) return null;

  const dateOnly = String(airDateStr).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return null;

  let release = DEFAULT_RELEASE;

  // Priorité 1 : override par série
  if (options.override?.hourUTC !== undefined && options.override?.dayOffset !== undefined) {
    release = options.override;
  }
  // Priorité 2 : air_time TMDB (rare mais fiable quand présent)
  else if (options.tmdbAirTime && /^\d{2}:\d{2}$/.test(options.tmdbAirTime)) {
    const [h] = options.tmdbAirTime.split(":").map(Number);
    release = { dayOffset: 0, hourUTC: h, label: "tmdb-air_time" };
  }
  // Priorité 3 : map network
  else {
    for (const n of networks) {
      if (NETWORK_RELEASE_MAP[n?.id]) {
        release = NETWORK_RELEASE_MAP[n.id];
        break;
      }
    }
  }

  const base = new Date(`${dateOnly}T00:00:00.000Z`);
  base.setUTCDate(base.getUTCDate() + release.dayOffset);
  base.setUTCHours(release.hourUTC, 0, 0, 0);
  return base;
};
