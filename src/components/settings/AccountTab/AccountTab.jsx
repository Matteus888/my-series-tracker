"use client";

import styles from "../shared/settings.module.css";
import avatarStyles from "./AccountTab.module.css";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Icon from "@mdi/react";
import { mdiContentSaveMoveOutline, mdiAccount, mdiUpload, mdiLink, mdiCancel } from "@mdi/js";
import { useToast } from "@/context/ToastContext";

export default function AccountTab({ session }) {
  const { update } = useSession();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [username, setUsername] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch("/api/user");
      const data = await response.json();
      if (data.user) {
        setUsername(data.user.username || "");
        setEmail(data.user.email || "");
        setAvatarUrl(data.user.profilePicture || "");
      }
    };
    fetchUser();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5MB.", "error");
      return;
    }
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveAvatar = async () => {
    if (!pendingFile && !externalUrl.trim()) return;
    setIsLoadingAvatar(true);

    try {
      if (pendingFile) {
        const formData = new FormData();
        formData.append("file", pendingFile);
        const response = await fetch("/api/user/avatar", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }
        const data = await response.json();
        setAvatarUrl(data.url);
        setPreviewUrl(null);
        setPendingFile(null);
        await update({ profilePicture: data.url });
      } else {
        const response = await fetch("/api/user/avatar", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: externalUrl }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "An error occurred.");
        }
        const data = await response.json();
        setAvatarUrl(data.url);
        setPreviewUrl(null);
        setExternalUrl("");
        await update({ profilePicture: data.url });
      }
      showToast("Avatar updated ✓");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsLoadingAvatar(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewUrl(null);
    setPendingFile(null);
    setExternalUrl("");
  };

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
      {/* Avatar */}
      <p className={styles.sectionTitle}>Profile picture</p>
      <div className={avatarStyles.avatarSection}>
        <div className={avatarStyles.avatarPreview}>
          {previewUrl || (avatarUrl && avatarUrl !== "/images/default-profile.png") ? (
            <Image
              src={previewUrl || avatarUrl}
              alt="avatar"
              width={150}
              height={150}
              className={avatarStyles.avatarImage}
              priority
              onError={() => setPreviewUrl(null)}
            />
          ) : (
            <Icon path={mdiAccount} size={2} />
          )}
          {isLoadingAvatar && <div className={avatarStyles.avatarOverlay}>...</div>}
        </div>
        <div className={avatarStyles.avatarActions}>
          {/* FILE */}
          <p className={avatarStyles.subTitle}>File</p>
          <div className={avatarStyles.fileRow}>
            <span className={avatarStyles.fileName}>{pendingFile ? pendingFile.name : "No file selected"}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className={avatarStyles.fileInput}
            />
            <button
              className={avatarStyles.avatarButton}
              onClick={() => fileInputRef.current.click()}
              disabled={isLoadingAvatar}
              title="Upload image"
            >
              <Icon path={mdiUpload} size={0.8} />
            </button>
          </div>
          {/* URL */}
          <p className={avatarStyles.subTitle}>URL</p>
          <div className={avatarStyles.urlSection}>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={externalUrl}
              onChange={(e) => {
                const val = e.target.value;
                setExternalUrl(val);
                if (val.startsWith("http://") || val.startsWith("https://")) {
                  setPreviewUrl(val);
                } else {
                  setPreviewUrl(null);
                }
              }}
              className={styles.input}
            />
          </div>
          {/* Validate / Cancel */}
          <div className={avatarStyles.actionButtons}>
            <button
              className={avatarStyles.avatarButtonValidate}
              onClick={handleSaveAvatar}
              disabled={isLoadingAvatar || (!pendingFile && !externalUrl.trim())}
              title="Save"
            >
              {isLoadingAvatar ? (
                <Icon path={mdiUpload} size={0.8} />
              ) : (
                <Icon path={mdiContentSaveMoveOutline} size={0.8} />
              )}
            </button>
            <button
              className={avatarStyles.avatarButtonCancel}
              onClick={handleCancelPreview}
              disabled={isLoadingAvatar || (!pendingFile && !externalUrl.trim())}
              title="Cancel"
            >
              <Icon path={mdiCancel} size={0.8} />
            </button>
          </div>
        </div>
      </div>
      <div className={styles.divider} />

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
          {isLoadingAccount ? <Icon path={mdiUpload} size={1} /> : <Icon path={mdiContentSaveMoveOutline} size={1} />}
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
          {isLoadingPassword ? <Icon path={mdiUpload} size={1} /> : <Icon path={mdiContentSaveMoveOutline} size={1} />}
        </button>
      </form>
    </div>
  );
}
