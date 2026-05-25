import styles from "./page.module.css";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { User } from "@/models/user.model";
import { getUserPublicProfile, getUserStats, getUserProfileAggregations } from "@/lib/api/user.api";
import { getTrackedSeries, getSeriesProgress } from "@/lib/api/series.api";
import { getRecentlyWatchedFlat } from "@/lib/api/episode.api";
import { APP_NAME } from "@/lib/constants/app.constants";
import ProfileHero from "@/components/profile/ProfileHero/ProfileHero";
import ProfilePresentation from "@/components/profile/ProfilePresentation/ProfilePresentation";
import ProfileRecentlyWatched from "@/components/profile/ProfileRecentlyWatched/ProfileRecentlyWatched";
import ProfileCurrentlyWatching from "@/components/profile/ProfileCurrentlyWatching/ProfileCurrentlyWatching";
import ProfileFavorites from "@/components/profile/ProfileFavorites/ProfileFavorites";
import ProfileTrackedSeries from "@/components/profile/ProfileTrackedSeries/ProfileTrackedSeries";
import ProfileStats from "@/components/profile/ProfileStats/ProfileStats";
import ProfileWatchHeatmap from "@/components/profile/ProfileWatchHeatmap/ProfileWatchHeatmap";
import ProfileEmptyState from "@/components/profile/ProfileEmptyState/ProfileEmptyState";
import { mdiTelevisionOff, mdiLock } from "@mdi/js";

export async function generateMetadata({ params }) {
  const { username } = await params;
  return { title: `@${username} - ${APP_NAME}` };
}

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params }) {
  const { username } = await params;
  const session = await getServerSession(authOptions);
  const viewerUserId = session?.user?.id ?? null;

  let profile;
  try {
    profile = await getUserPublicProfile(User, username, viewerUserId);
  } catch {
    notFound();
  }

  const { isOwner } = profile;
  const stats = await getUserStats(User, profile._id);

  let trackedSeries = [];
  let progressMap = {};
  if (isOwner || profile.publicLists) {
    const tracked = await getTrackedSeries(User, profile._id);
    trackedSeries = tracked.map((t) => ({
      tmdbId: t.tmdbId,
      status: t.status,
      isFavorite: t.isFavorite,
      rating: t.rating ?? null,
      series: t.seriesId
        ? {
            _id: t.seriesId._id.toString(),
            tmdbId: t.seriesId.tmdbId,
            title: t.seriesId.title,
            posterPath: t.seriesId.posterPath ?? null,
            backdropPath: t.seriesId.backdropPath ?? null,
            firstAirDate: t.seriesId.firstAirDate ? t.seriesId.firstAirDate.toISOString() : null,
            status: t.seriesId.status ?? null,
            numberOfEpisodes: t.seriesId.numberOfEpisodes ?? null,
            voteAverage: t.seriesId.ratings?.tmdb?.score ?? null,
          }
        : null,
    }));
    const progressArr = await getSeriesProgress(profile._id, User);
    progressMap = Object.fromEntries(progressArr.map((p) => [String(p.tmdbId), p]));
  }

  let recentlyWatched = [];
  if (isOwner || profile.publicActivity) {
    recentlyWatched = await getRecentlyWatchedFlat(profile._id);
  }

  const aggregations = await getUserProfileAggregations(User, profile._id);

  // Posters pour le hero : favoris en priorité, sinon les premières séries trackées
  const heroPosters = trackedSeries
    .filter((t) => t.isFavorite && t.series?.posterPath)
    .map((t) => t.series.posterPath)
    .slice(0, 12);
  if (heroPosters.length < 12) {
    const fallback = trackedSeries.filter((t) => !t.isFavorite && t.series?.posterPath).map((t) => t.series.posterPath);
    heroPosters.push(...fallback.slice(0, 12 - heroPosters.length));
  }

  // Le visiteur peut-il voir les listes/activité ? (owner ou flags publics)
  const canSeeLists = isOwner || profile.publicLists;
  const canSeeActivity = isOwner || profile.publicActivity;

  // Niveau 1 : profil totalement vide (autorisé à voir, mais rien à montrer)
  const isEmptyProfile = canSeeLists && trackedSeries.length === 0;

  // Niveau 2 : tout est masqué par les privacy settings (pas owner, listes + activité privées)
  const isFullyPrivate = !isOwner && !profile.publicLists && !profile.publicActivity;

  return (
    <div className={styles.container}>
      <ProfileHero posterPaths={heroPosters} />

      <ProfilePresentation profile={profile} stats={stats} />

      {/* ─── Niveau 2 : profil entièrement privé ─── */}
      {isFullyPrivate && (
        <div className={styles.section}>
          <ProfileEmptyState
            icon={mdiLock}
            title="Private activity"
            text={`@${username} keeps their lists and activity private.`}
          />
        </div>
      )}

      {/* ─── Niveau 1 : profil vide (autorisé mais rien trackée) ─── */}
      {isEmptyProfile && (
        <div className={styles.section}>
          <ProfileEmptyState
            icon={mdiTelevisionOff}
            title={isOwner ? "No series yet" : "Nothing tracked yet"}
            text={
              isOwner
                ? "You haven't started tracking any series. Explore the catalog to get going."
                : `@${username} hasn't started tracking any series yet.`
            }
            action={isOwner ? { href: "/series", label: "Explore series" } : null}
          />
        </div>
      )}

      {/* Stats agrégées : toujours visibles si profil public */}
      <div className={styles.section}>
        <ProfileStats aggregations={aggregations} username={username} />
      </div>

      {/* Heatmap : soumise à publicActivity */}
      {canSeeActivity && (
        <div className={styles.section}>
          <ProfileWatchHeatmap heatmap={aggregations.heatmap} username={username} />
        </div>
      )}

      {/* ─── Sections normales ─── */}
      {canSeeActivity && (
        <div className={styles.section}>
          <ProfileRecentlyWatched episodes={recentlyWatched} username={username} />
        </div>
      )}

      {canSeeLists && (
        <>
          <div className={styles.section}>
            <ProfileCurrentlyWatching trackedSeries={trackedSeries} progressMap={progressMap} username={username} />
          </div>

          <div className={styles.section}>
            <ProfileFavorites trackedSeries={trackedSeries} progressMap={progressMap} username={username} />
          </div>

          <div className={styles.section}>
            <ProfileTrackedSeries trackedSeries={trackedSeries} progressMap={progressMap} username={username} />
          </div>
        </>
      )}
    </div>
  );
}
