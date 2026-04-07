"use client";

import styles from "../shared/settings.module.css";
import Icon from "@mdi/react";
import { mdiContentSaveMoveOutline } from "@mdi/js";
import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";

export default function ProfileTab({ session }) {
  const { showToast } = useToast();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("prefer-not-to-say");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch("/api/user");
      const data = await response.json();
      if (data.user) {
        setFirstname(data.user.firstname || "");
        setLastname(data.user.lastname || "");
        setBirthDate(data.user.birthDate ? data.user.birthDate.slice(0, 10) : "");
        setGender(data.user.gender || "prefer-not-to-say");
        setBio(data.user.bio || "");
      }
    };
    fetchUser();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstname, lastname, birthDate, gender, bio }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "An error occurred.");
      }
      showToast("Profile updated ✓");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.section}>
      <p className={styles.sectionTitle}>Profile information</p>
      <form onSubmit={handleSave} className={styles.section}>
        <div className={styles.field}>
          <label className={styles.label}>Firstname</label>
          <input
            type="text"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            className={styles.input}
            maxLength={50}
            placeholder="Your firstname"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Lastname</label>
          <input
            type="text"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            className={styles.input}
            maxLength={50}
            placeholder="Your lastname"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Birth date</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} className={styles.input}>
            <option value="prefer-not-to-say">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={styles.input}
            maxLength={200}
            rows={3}
            placeholder="Tell us about yourself..."
          />
          <p className={styles.hint}>{bio.length}/200 characters</p>
        </div>
        <button type="submit" className={styles.saveButton} title="Save changes" disabled={isLoading}>
          <Icon path={mdiContentSaveMoveOutline} size={1} />
        </button>
      </form>
    </div>
  );
}
