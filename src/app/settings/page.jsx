"use client";

import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
    <div className={styles.container}>
      <h1 className={styles.title}>Settings</h1>
      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* Contenu */}
      <div className={styles.content}>
        {activeTab === "Account" && <AccountTab session={session} />}
        {activeTab === "Profile" && <ProfileTab session={session} />}
        {activeTab === "Privacy" && <PrivacyTab session={session} />}
        {activeTab === "Danger Zone" && <DangerZoneTab session={session} />}
      </div>
    </div>
  );
}
