"use client";

import avatarStyles from "./AccountTab.module.css";
import styles from "../shared/settings.module.css";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Icon from "@mdi/react";
import { mdiAccount, mdiUpload, mdiContentSaveMoveOutline, mdiCancel } from "@mdi/js";
import { useToast } from "@/context/ToastContext";

export default function AccountAvatarSection({ session }) {
  const { update } = useSession();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch("/api/user");
      const data = await response.json();
      if (data.user) {
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

  const handleSave = async () => {
    if (!pendingFile && !externalUrl.trim()) return;
    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setPendingFile(null);
    setExternalUrl("");
  };

  return (
    <>
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
          {isLoading && <div className={avatarStyles.avatarOverlay}>...</div>}
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
              disabled={isLoading}
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
              onClick={handleSave}
              disabled={isLoading || (!pendingFile && !externalUrl.trim())}
              title="Save"
            >
              {isLoading ? <Icon path={mdiUpload} size={0.8} /> : <Icon path={mdiContentSaveMoveOutline} size={0.8} />}
            </button>
            <button
              className={avatarStyles.avatarButtonCancel}
              onClick={handleCancel}
              disabled={isLoading || (!pendingFile && !externalUrl.trim())}
              title="Cancel"
            >
              <Icon path={mdiCancel} size={0.8} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
