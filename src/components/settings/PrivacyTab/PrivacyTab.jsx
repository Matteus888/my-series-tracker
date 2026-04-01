"use client";

import styles from "../shared/settings.module.css";
import privacyStyles from "./PrivacyTab.module.css";
import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";

export default function PrivacyTab({ session }) {
  const { showToast } = useToast();
  const [isPublic, setIsPublic] = useState(true);
  const [publicLists, setPublicLists] = useState(true);
  const [publicActivity, setPublicActivity] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch("/api/user");
      const data = await response.json();
      if (data.user) {
        setIsPublic(data.user.isPublic ?? true);
        setPublicLists(data.user.publicLists ?? true);
        setPublicActivity(data.user.publicActivity ?? true);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic, publicLists, publicActivity }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "An error occurred.");
      }
      showToast("Privacy settings updated ✓");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.section}>
      <p className={styles.sectionTitle}>Privacy settings</p>
      <form onSubmit={handleSave} className={styles.section}>
        <div className={privacyStyles.toggleField}>
          <div className={privacyStyles.toggleInfo}>
            <span className={styles.label}>Public profile</span>
            <p className={styles.hint}>Allow other users to see your profile</p>
          </div>
          <label className={privacyStyles.toggle}>
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            <span className={privacyStyles.slider} />
          </label>
        </div>
        <div className={styles.divider} />
        <div className={privacyStyles.toggleField}>
          <div className={privacyStyles.toggleInfo}>
            <span className={styles.label}>Public lists</span>
            <p className={styles.hint}>Allow other users to see your lists</p>
          </div>
          <label className={privacyStyles.toggle}>
            <input type="checkbox" checked={publicLists} onChange={(e) => setPublicLists(e.target.checked)} />
            <span className={privacyStyles.slider} />
          </label>
        </div>
        <div className={styles.divider} />

        <div className={privacyStyles.toggleField}>
          <div className={privacyStyles.toggleInfo}>
            <span className={styles.label}>Public activity</span>
            <p className={styles.hint}>Allow other users to see your recent activity</p>
          </div>
          <label className={privacyStyles.toggle}>
            <input type="checkbox" checked={publicActivity} onChange={(e) => setPublicActivity(e.target.checked)} />
            <span className={privacyStyles.slider} />
          </label>
        </div>

        <button type="submit" className={styles.saveButton} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
