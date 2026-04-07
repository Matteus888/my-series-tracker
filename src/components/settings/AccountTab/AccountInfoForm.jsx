"use client";

import styles from "../shared/settings.module.css";
import Icon from "@mdi/react";
import { mdiContentSaveMoveOutline } from "@mdi/js";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";

export default function AccountInfoForm({ session }) {
  const { update } = useSession();
  const { showToast } = useToast();

  const [username, setUsername] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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
      await update({ name: username, email });
      showToast("Account updated ✓");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <p className={styles.sectionTitle}>Account information</p>
      <form className={styles.section} onSubmit={handleSubmit}>
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
        <button type="submit" className={styles.saveButton} title="Save changes" disabled={isLoading}>
          <Icon path={mdiContentSaveMoveOutline} size={1} />
        </button>
      </form>
    </>
  );
}
