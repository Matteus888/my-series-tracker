import dbConnect from "@/lib/db/db.connect";
import { Episode } from "@/models/episode.model";
import { getPersonDetails } from "./tmdb.api";

const PRIORITY_DEPARTMENTS = ["Acting", "Directing", "Writing", "Production", "Creator"];

const computeAge = (birthday, deathday) => {
  if (!birthday) return null;
  const birth = new Date(birthday);
  const end = deathday ? new Date(deathday) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const m = end.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
  return age;
};

const EXCLUDED_GENRE_IDS = [10763, 10764, 10767, 10766];

const filterAndCleanCredits = (credits = []) => {
  return credits.filter((c) => !c.genre_ids?.some((id) => EXCLUDED_GENRE_IDS.includes(id)));
};

const dedupeCastCredits = (cast = []) => {
  const map = new Map();
  for (const c of cast) {
    const existing = map.get(c.id);
    if (!existing) {
      map.set(c.id, { ...c, characters: [c.character].filter(Boolean) });
    } else {
      if (c.character && !existing.characters.includes(c.character)) {
        existing.characters.push(c.character);
      }
      existing.episode_count = (existing.episode_count ?? 0) + (c.episode_count ?? 0);
    }
  }
  return Array.from(map.values()).map((c) => ({
    ...c,
    character: c.characters.join(" / ") || null,
  }));
};

const groupCrewByDepartment = (crew = []) => {
  const byDept = new Map();
  for (const c of crew) {
    const dept = c.department || "Other";
    if (!byDept.has(dept)) byDept.set(dept, new Map());
    const seriesMap = byDept.get(dept);
    const key = c.id; // une série
    if (!seriesMap.has(key)) {
      seriesMap.set(key, { ...c, jobs: [c.job].filter(Boolean) });
    } else {
      const existing = seriesMap.get(key);
      if (c.job && !existing.jobs.includes(c.job)) existing.jobs.push(c.job);
      existing.episode_count = (existing.episode_count ?? 0) + (c.episode_count ?? 0);
    }
  }

  const result = [];
  for (const [dept, seriesMap] of byDept) {
    const credits = Array.from(seriesMap.values()).map((c) => ({
      ...c,
      job: c.jobs.join(" / "),
    }));
    result.push({ department: dept, credits });
  }
  return result;
};

const sortDepartments = (departments) => {
  return departments.sort((a, b) => {
    const ai = PRIORITY_DEPARTMENTS.indexOf(a.department);
    const bi = PRIORITY_DEPARTMENTS.indexOf(b.department);
    if (ai === -1 && bi === -1) return a.department.localeCompare(b.department);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
};

const scoreKnownFor = (credit) => {
  const pop = credit.popularity ?? 0;
  const eps = credit.episode_count ?? 1;
  return pop * Math.sqrt(eps);
};

export const getPersonFullData = async (personId, userId = null) => {
  const person = await getPersonDetails(personId);
  if (!person) throw new Error("Person not found");

  // ─── Crédits TV ───────────────────────────────────
  const rawCast = filterAndCleanCredits(person.tv_credits?.cast ?? []);
  const rawCrew = filterAndCleanCredits(person.tv_credits?.crew ?? []);

  const cast = dedupeCastCredits(rawCast).map((c) => ({
    tmdbId: c.id,
    name: c.name,
    character: c.character,
    posterPath: c.poster_path ?? null,
    firstAirDate: c.first_air_date ?? null,
    episodeCount: c.episode_count ?? 0,
    voteAverage: c.vote_average ?? 0,
    popularity: c.popularity ?? 0,
    genreIds: c.genre_ids ?? [],
    overview: c.overview ?? null,
  }));

  const crewByDept = groupCrewByDepartment(rawCrew).map(({ department, credits }) => ({
    department,
    credits: credits.map((c) => ({
      tmdbId: c.id,
      name: c.name,
      job: c.job,
      posterPath: c.poster_path ?? null,
      firstAirDate: c.first_air_date ?? null,
      episodeCount: c.episode_count ?? 0,
      voteAverage: c.vote_average ?? 0,
      popularity: c.popularity ?? 0,
      genreIds: c.genre_ids ?? [],
      overview: c.overview ?? null,
    })),
  }));

  // ─── Known for : top 10 toutes catégories confondues ──
  const allCredits = [
    ...cast.map((c) => ({ ...c, _kind: "cast", _department: "Acting" })),
    ...crewByDept.flatMap((d) => d.credits.map((c) => ({ ...c, _kind: "crew", _department: d.department }))),
  ];

  // Déduplique par série : pour chaque série, on garde le crédit du département le plus prioritaire
  const departmentRank = (dept) => {
    const idx = PRIORITY_DEPARTMENTS.indexOf(dept);
    return idx === -1 ? PRIORITY_DEPARTMENTS.length : idx;
  };

  const bySeriesId = new Map();
  for (const credit of allCredits) {
    const existing = bySeriesId.get(credit.tmdbId);
    if (!existing || departmentRank(credit._department) < departmentRank(existing._department)) {
      bySeriesId.set(credit.tmdbId, credit);
    }
  }

  const knownFor = Array.from(bySeriesId.values())
    .sort((a, b) => scoreKnownFor(b) - scoreKnownFor(a))
    .slice(0, 10);

  // ─── Filmography par département ──────────────────
  const filmography = sortDepartments([
    ...(cast.length > 0
      ? [
          {
            department: "Acting",
            credits: [...cast].sort((a, b) => {
              const da = a.firstAirDate ? new Date(a.firstAirDate).getTime() : 0;
              const db = b.firstAirDate ? new Date(b.firstAirDate).getTime() : 0;
              return db - da;
            }),
          },
        ]
      : []),
    ...crewByDept.map(({ department, credits }) => ({
      department,
      credits: [...credits].sort((a, b) => {
        const da = a.firstAirDate ? new Date(a.firstAirDate).getTime() : 0;
        const db = b.firstAirDate ? new Date(b.firstAirDate).getTime() : 0;
        return db - da;
      }),
    })),
  ]);

  // ─── Stats ────────────────────────────────────────
  const totalSeries = new Set(allCredits.map((c) => c.tmdbId)).size;
  const totalEpisodes = allCredits.reduce((sum, c) => sum + (c.episodeCount ?? 0), 0);
  const allYears = allCredits
    .map((c) => (c.firstAirDate ? new Date(c.firstAirDate).getFullYear() : null))
    .filter(Boolean);
  const yearsSpan = allYears.length > 0 ? `${Math.min(...allYears)} – ${Math.max(...allYears)}` : null;

  // ─── Posters mosaïque pour le hero ────────────────
  const heroPosterPaths = [];
  const seenIds = new Set();
  for (const credit of knownFor) {
    if (credit.posterPath && !seenIds.has(credit.tmdbId)) {
      heroPosterPaths.push(credit.posterPath);
      seenIds.add(credit.tmdbId);
    }
  }
  if (heroPosterPaths.length < 40) {
    for (const dept of filmography) {
      for (const credit of dept.credits) {
        if (heroPosterPaths.length >= 40) break;
        if (credit.posterPath && !seenIds.has(credit.tmdbId)) {
          heroPosterPaths.push(credit.posterPath);
          seenIds.add(credit.tmdbId);
        }
      }
      if (heroPosterPaths.length >= 40) break;
    }
  }

  // ─── Episodes en base de données ──────────────────
  await dbConnect();
  const personIdNum = Number(personId);
  const episodesInDb = await Episode.find({
    $or: [{ "cast.tmdbId": personIdNum }, { "crew.tmdbId": personIdNum }],
  })
    .select("_id tmdbEpisodeId seriesId seasonNumber episodeNumber title stillPath airDate duration ratings cast crew")
    .lean();

  // Récupère les titres des séries concernées (en une seule requête)
  const seriesIds = [...new Set(episodesInDb.map((e) => e.seriesId.toString()))];
  const seriesDocs =
    seriesIds.length > 0
      ? await (
          await import("@/models/series.model")
        ).Series.find({ _id: { $in: seriesIds } })
          .select("_id tmdbId title")
          .lean()
      : [];
  const seriesById = new Map(seriesDocs.map((s) => [s._id.toString(), s]));

  // Charge les progress de l'utilisateur (si connecté) sur ces épisodes
  const { EpisodeProgress } = await import("@/models/episodeProgress.model");
  let progressByEpisodeId = new Map();
  if (userId && episodesInDb.length > 0) {
    const episodeIds = episodesInDb.map((e) => e._id);
    const progressList = await EpisodeProgress.find({
      userId,
      episodeId: { $in: episodeIds },
    })
      .select("episodeId watched watchedAt rating")
      .lean();
    progressByEpisodeId = new Map(progressList.map((p) => [p.episodeId.toString(), p]));
  }

  // Regroupe par série
  const episodesByseries = new Map();
  for (const ep of episodesInDb) {
    const key = ep.seriesId.toString();
    if (!episodesByseries.has(key)) episodesByseries.set(key, []);

    const castEntry = ep.cast?.find((c) => c.tmdbId === personIdNum);
    const crewEntries = ep.crew?.filter((c) => c.tmdbId === personIdNum) ?? [];
    const prog = progressByEpisodeId.get(ep._id.toString());

    episodesByseries.get(key).push({
      _id: ep._id.toString(),
      tmdbEpisodeId: ep.tmdbEpisodeId,
      seriesId: key,
      seasonNumber: ep.seasonNumber,
      episodeNumber: ep.episodeNumber,
      title: ep.title,
      stillPath: ep.stillPath,
      airDate: ep.airDate ? ep.airDate.toISOString() : null,
      duration: ep.duration ?? null,
      ratings: ep.ratings ?? null,
      character: castEntry?.character ?? null,
      isGuest: castEntry?.isGuest ?? false,
      jobs: crewEntries.map((c) => c.job).filter(Boolean),
      watched: prog?.watched ?? false,
      watchedAt: prog?.watchedAt ? prog.watchedAt.toISOString() : null,
      rating: prog?.rating ?? null,
    });
  }

  const episodesInTrackedShows = Array.from(episodesByseries.entries())
    .map(([seriesId, eps]) => {
      const seriesDoc = seriesById.get(seriesId);
      return {
        seriesId,
        seriesTitle: seriesDoc?.title ?? "Unknown",
        tmdbSeriesId: seriesDoc?.tmdbId ?? null,
        episodes: eps.sort((a, b) => {
          if (a.seasonNumber !== b.seasonNumber) return a.seasonNumber - b.seasonNumber;
          return a.episodeNumber - b.episodeNumber;
        }),
      };
    })
    .sort((a, b) => a.seriesTitle.localeCompare(b.seriesTitle));

  // ─── Person formaté ───────────────────────────────
  return {
    person: {
      tmdbId: person.id,
      name: person.name,
      biography: person.biography ?? null,
      birthday: person.birthday ?? null,
      deathday: person.deathday ?? null,
      placeOfBirth: person.place_of_birth ?? null,
      gender: person.gender,
      knownForDepartment: person.known_for_department ?? null,
      alsoKnownAs: person.also_known_as ?? [],
      homepage: person.homepage ?? null,
      profilePath: person.profile_path ?? null,
      popularity: person.popularity ?? 0,
      age: computeAge(person.birthday, person.deathday),
      externalIds: {
        imdb: person.external_ids?.imdb_id ?? null,
        instagram: person.external_ids?.instagram_id ?? null,
        twitter: person.external_ids?.twitter_id ?? null,
        facebook: person.external_ids?.facebook_id ?? null,
        tiktok: person.external_ids?.tiktok_id ?? null,
        youtube: person.external_ids?.youtube_id ?? null,
        wikidata: person.external_ids?.wikidata_id ?? null,
      },
      profileImages: (person.images?.profiles ?? []).map((img) => ({
        filePath: img.file_path,
        width: img.width,
        height: img.height,
        aspectRatio: img.aspect_ratio,
      })),
    },
    knownFor,
    filmography,
    stats: {
      totalSeries,
      totalEpisodes,
      yearsSpan,
    },
    episodesInTrackedShows,
    heroPosterPaths,
  };
};
