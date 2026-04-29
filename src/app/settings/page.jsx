"use client";

import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle/PageTitle";
import SettingsHeader from "@/components/settings/SettingsHeader/SettingsHeader";
import AccountTab from "@/components/settings/AccountTab/AccountTab";
import ProfileTab from "@/components/settings/ProfileTab/ProfileTab";
import PrivacyTab from "@/components/settings/PrivacyTab/PrivacyTab";
import DangerZoneTab from "@/components/settings/DangerZoneTab/DangerZoneTab";

const TABS = ["Account", "Profile", "Privacy", "Danger Zone"];

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Account");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") return null;

  return (
    <div className={styles.page}>
      <PageTitle title="Settings" />
      <SettingsHeader tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className={styles.container}>
        <div className={styles.content}>
          {activeTab === "Account" && <AccountTab session={session} />}
          {activeTab === "Profile" && <ProfileTab session={session} />}
          {activeTab === "Privacy" && <PrivacyTab session={session} />}
          {activeTab === "Danger Zone" && <DangerZoneTab session={session} />}
        </div>
      </div>
    </div>
  );
}
