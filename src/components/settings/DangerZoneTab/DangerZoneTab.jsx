"use client";

import styles from "../shared/settings.module.css";
import dangerStyles from "./DangerZoneTab.module.css";
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

  const handleDelete = async (e) => {
    e.preventDefault();
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
    <div className={styles.section}>
      <p className={styles.sectionTitle}>Danger zone</p>
      <div className={dangerStyles.dangerBox}>
        <p className={dangerStyles.dangerTitle}>Delete account</p>
        <p className={dangerStyles.dangerText}>
          This action is irreversible. All your data will be permanently deleted — tracked series, lists, episode
          progress, and ratings.
        </p>
        <form onSubmit={handleDelete} className={styles.section}>
          <div className={styles.field}>
            <label className={styles.label}>
              Type your username <strong>{session?.user?.name}</strong> to confirm
            </label>
            <input
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`${styles.input} ${dangerStyles.input}`}
              placeholder={session?.user?.name}
              required
            />
          </div>
          <button
            type="submit"
            className={dangerStyles.deleteButton}
            disabled={isLoading || confirm !== session?.user?.name}
          >
            {isLoading ? (
              <>
                <Icon path={mdiUpload} size={0.7} />
                {"Deleting..."}
              </>
            ) : (
              <>
                <Icon path={mdiDeleteForeverOutline} size={0.7} />
                {"Delete my account"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
