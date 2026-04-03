"use client";

import styles from "../shared/settings.module.css";
import Icon from "@mdi/react";
import { mdiUpload, mdiContentSaveMoveOutline } from "@mdi/js";
import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import PasswordInput from "@/components/ui/PasswordInput/PasswordInput";

export default function AccountPasswordForm() {
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "An error occurred.");
      }
      showToast("Password updated ✓");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <p className={styles.sectionTitle}>Change password</p>
      <form onSubmit={handleSubmit} className={styles.section}>
        <div className={styles.field}>
          <label className={styles.label}>Current password</label>
          <PasswordInput
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>New password</label>
          <PasswordInput
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={styles.input}
            minLength={8}
            required
          />
          <p className={styles.hint}>Minimum 8 characters</p>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Confirm new password</label>
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={styles.input}
            minLength={8}
            required
          />
        </div>
        <button type="submit" className={styles.saveButton} title="Save changes" disabled={isLoading}>
          {isLoading ? <Icon path={mdiUpload} size={1} /> : <Icon path={mdiContentSaveMoveOutline} size={1} />}
        </button>
      </form>
    </>
  );
}
