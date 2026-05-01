"use client";

import styles from "./PrivacyTab.module.css";
import sharedStyles from "../shared/settings.module.css";
import Icon from "@mdi/react";
import { mdiContentSaveMoveOutline } from "@mdi/js";
import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";

const TOGGLES = [
  { key: "isPublic", label: "Public profile", description: "Allow other users to see your profile" },
  { key: "publicLists", label: "Public lists", description: "Allow other users to see your lists" },
  { key: "publicActivity", label: "Public activity", description: "Allow other users to see your recent activity" },
];

export default function PrivacyTab({ session }) {
  const { showToast } = useToast();
  const [values, setValues] = useState({ isPublic: true, publicLists: true, publicActivity: true });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch("/api/user");
      const data = await response.json();
      if (data.user) {
        setValues({
          isPublic: data.user.isPublic ?? true,
          publicLists: data.user.publicLists ?? true,
          publicActivity: data.user.publicActivity ?? true,
        });
      }
    };
    fetchUser();
  }, []);

  const handleToggle = (key) => (e) => {
    setValues((prev) => ({ ...prev, [key]: e.target.checked }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
    <div className={styles.card}>
      <p className={sharedStyles.sectionTitle}>Privacy settings</p>
      <form onSubmit={handleSave} className={styles.form}>
        <div className={styles.grid}>
          {TOGGLES.map(({ key, label, description }) => (
            <div key={key} className={`${styles.miniCard} ${values[key] ? styles.miniCardActive : ""}`}>
              <div className={styles.miniCardText}>
                <span className={styles.miniCardTitle}>{label}</span>
                <p className={styles.miniCardDescription}>{description}</p>
              </div>
              <label className={styles.toggle}>
                <input type="checkbox" checked={values[key]} onChange={handleToggle(key)} />
                <span className={styles.slider} />
              </label>
            </div>
          ))}
        </div>

        <button type="submit" className={sharedStyles.saveButton} title="Save changes" disabled={isLoading}>
          <Icon path={mdiContentSaveMoveOutline} size={0.8} />
        </button>
      </form>
    </div>
  );
}
