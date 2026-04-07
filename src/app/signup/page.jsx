"use client";

import styles from "@/app/signup/page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Icon from "@mdi/react";
import { mdiAccountPlus, mdiCheck, mdiUpload } from "@mdi/js";
import PasswordInput from "@/components/ui/PasswordInput/PasswordInput";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error during signup.");

      const loginResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      if (loginResult?.error) throw new Error("Account created but login failed. Please log in manually.");

      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          <Icon path={mdiAccountPlus} size={1.2} />
          Registration
        </h1>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={styles.input}
              required
              placeholder="Username"
              minLength={3}
              maxLength={30}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              required
              placeholder="your@email.com"
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="•••••••• (8 characters min)"
              className={styles.input}
              minLength={8}
            />
            <p className={styles.hint}>Minimum 8 characters</p>
          </div>

          <button type="submit" disabled={isLoading} className={styles.submitButton}>
            {isLoading ? <Icon path={mdiUpload} size={1} /> : <Icon path={mdiCheck} size={1} />}
          </button>
        </form>

        <div className={styles.footer}>
          <Link href="/login" className={styles.link}>
            Already have an account? Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
