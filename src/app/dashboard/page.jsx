import styles from "./page.module.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getUserProfile, getUserStats } from "@/lib/api/user.api";
import { getContinueWatchingCount, getStartWatchingCount } from "@/lib/api/episode.api";
import { User } from "@/models/user.model";
import PageTitle from "@/components/ui/PageTitle/PageTitle";
import DashboardHeader from "@/components/dashboard/DashboardHeader/DashboardHeader";
import ContinueWatchingSection from "@/components/dashboard/ContinueWatchingSection/ContinueWatchingSection";
import UpcomingSection from "@/components/dashboard/UpcomingSection/UpcomingSection";
import StartWatchingSection from "@/components/dashboard/StartWatchingSection/StartWatchingSection";
import RecentlyWatchedSection from "@/components/dashboard/RecentlyWatchedSection/RecentlyWatchedSection";
import { mdiViewDashboardEditOutline } from "@mdi/js";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [user, stats, cwCount, swCount] = await Promise.all([
    getUserProfile(User, session.user.id),
    getUserStats(User, session.user.id),
    getContinueWatchingCount(User, session.user.id),
    getStartWatchingCount(session.user.id),
  ]);

  return (
    <div className={styles.page}>
      <PageTitle title="Dashboard" icon={mdiViewDashboardEditOutline} />
      <DashboardHeader
        username={user.username}
        firstname={user.firstname}
        lastname={user.lastname}
        bio={user.bio}
        profilePicture={user.profilePicture}
        stats={stats}
      />
      <ContinueWatchingSection initialSkeletonCount={cwCount} />
      <UpcomingSection />
      <RecentlyWatchedSection />
      <StartWatchingSection initialSkeletonCount={swCount} />
    </div>
  );
}
