"use client";

import styles from "../shared/settings.module.css";
import Icon from "@mdi/react";
import { mdiContentSaveOutline, mdiContentSaveMoveOutline } from "@mdi/js";
import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";

export default function AccountTab({ session }) {
  const { showToast } = useToast();

  const [username, setUsername] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch("/api/user");
      const data = await response.json();
      if (data.user) {
        setUsername(data.user.username || "");
        setEmail(data.user.email || "");
      }
    };
    fetchUser();
  }, []);

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setIsLoadingAccount(true);
    try {
      const response = await fetch("/api/user/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "An error occurred.");
      }
      showToast("Account updated ✓");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsLoadingAccount(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    setIsLoadingPassword(true);
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
      setIsLoadingPassword(false);
    }
  };

  return (
    <div className={styles.section}>
      {/* Username & Email */}
      <p className={styles.sectionTitle}>Account information</p>
      <form className={styles.section} onSubmit={handleSaveAccount}>
        <div className={styles.field}>
          <label className={styles.label}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            minLength={3}
            maxLength={30}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <button type="submit" className={styles.saveButton} title="Save changes" disabled={isLoadingAccount}>
          {isLoadingAccount ? (
            <Icon path={mdiContentSaveOutline} size={1} />
          ) : (
            <Icon path={mdiContentSaveMoveOutline} size={1} />
          )}
        </button>
      </form>
      <div className={styles.divider} />

      {/* Password */}
      <p className={styles.sectionTitle}>Change password</p>
      <form onSubmit={handleSavePassword} className={styles.section}>
        <div className={styles.field}>
          <label className={styles.label}>Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>New password</label>
          <input
            type="password"
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
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={styles.input}
            minLength={8}
            required
          />
        </div>
        <button type="submit" className={styles.saveButton} title="Save changes" disabled={isLoadingPassword}>
          {isLoadingPassword ? (
            <Icon path={mdiContentSaveOutline} size={1} />
          ) : (
            <Icon path={mdiContentSaveMoveOutline} size={1} />
          )}
        </button>
      </form>
    </div>
  );
}
