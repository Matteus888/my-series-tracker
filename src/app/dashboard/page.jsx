import styles from "./page.module.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/api/user.api";
import { User } from "@/models/user.model";
import PageTitle from "@/components/ui/PageTitle/PageTitle";
import ProfileHeader from "@/components/dashboard/ProfileHeader/ProfileHeader";
import ContinueWatchingSection from "@/components/dashboard/ContinueWatchingSection/ContinueWatchingSection";
import CalendarSection from "@/components/dashboard/CalendarSection/CalendarSection";
import StartWatchingSection from "@/components/dashboard/StartWatchingSection/StartWatchingSection";
import RecentlyWatchedSection from "@/components/dashboard/RecentlyWatchedSection/RecentlyWatchedSection";

export const metadata = {
  title: "Dashboard - My Series Tracker",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await getUserProfile(User, session.user.id);

  return (
    <div className={styles.page}>
      <PageTitle title="Dashboard" />
      <ProfileHeader username={user.username} profilePicture={user.profilePicture} />
      <ContinueWatchingSection />
      <CalendarSection />
      <RecentlyWatchedSection />
      <StartWatchingSection />
    </div>
  );
}
