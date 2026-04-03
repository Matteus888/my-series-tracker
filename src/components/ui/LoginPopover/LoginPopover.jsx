"use client";

import styles from "./LoginPopover.module.css";
import Icon from "@mdi/react";
import { mdiLogin, mdiCheck } from "@mdi/js";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import PasswordInput from "../PasswordInput/PasswordInput";

export default function LoginPopover({ onClose, popoverRef }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        showToast("Invalid email or password.", "error");
      } else {
        showToast("Welcome back! ✓");
        onClose();
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.popover} ref={popoverRef}>
      <div className={styles.titleWrapper}>
        <Icon path={mdiLogin} size={0.7} />
        <p className={styles.title}>Log In</p>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
        />
        <PasswordInput
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
        />
        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          <Icon path={mdiCheck} size={0.8} />
        </button>
      </form>
      <div className={styles.footer}>
        <Link href="/signup" className={styles.link} onClick={onClose}>
          No account? Sign up
        </Link>
      </div>
    </div>
  );
}
