"use client";

import styles from "./DangerZoneTab.module.css";
import sharedStyles from "../shared/settings.module.css";
import Icon from "@mdi/react";
import { mdiDeleteForeverOutline, mdiUpload } from "@mdi/js";
import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DangerZoneTab({ session }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    if (confirm !== session?.user?.name) {
      showToast("Username does not match.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/user", {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "An error occurred.");
      }
      await signOut({ redirect: false });
      router.push("/");
      showToast("Your account has been deleted.");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <p className={styles.title}>Delete account</p>
        <p className={styles.description}>
          This action is irreversible. All your data will be permanently deleted — tracked series, lists, episode
          progress, and ratings.
        </p>
      </div>

      <form onSubmit={handleDelete} className={styles.form}>
        <div className={sharedStyles.field}>
          <label className={sharedStyles.label}>
            Type your username <strong>{session?.user?.name}</strong> to confirm
          </label>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={`${sharedStyles.input} ${styles.input}`}
            placeholder={session?.user?.name}
            required
          />
        </div>

        {!showConfirm ? (
          <button type="submit" className={styles.deleteButton} disabled={isLoading || confirm !== session?.user?.name}>
            <Icon path={mdiDeleteForeverOutline} size={0.7} />
            {isLoading ? "Deleting..." : "Delete my account"}
          </button>
        ) : (
          <div className={styles.confirmBox}>
            <p className={styles.confirmText}>Are you absolutely sure? This cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button type="submit" className={styles.confirmYes} disabled={isLoading}>
                <Icon path={mdiDeleteForeverOutline} size={0.7} />
                {isLoading ? "Deleting..." : "Yes, delete my account"}
              </button>
              <button type="button" className={styles.confirmNo} onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
