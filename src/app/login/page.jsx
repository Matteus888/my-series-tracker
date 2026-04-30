"use client";

import styles from "@/app/login/page.module.css";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@mdi/react";
import { mdiLogin, mdiCheck, mdiLoading } from "@mdi/js";
import PageTitle from "@/components/ui/PageTitle/PageTitle";
import PasswordInput from "@/components/ui/PasswordInput/PasswordInput";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const from = searchParams.get("from") || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      router.push(from);
    }
  };

  return (
    <main className={styles.page}>
      <PageTitle title="Log In" icon={mdiLogin} />

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <Icon path={mdiLogin} size={1} />
            <span>Welcome back</span>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.input}
                required
              />
            </div>

            <button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading ? (
                <Icon path={mdiLoading} size={0.9} spin />
              ) : (
                <span>
                  <Icon path={mdiCheck} size={0.9} />
                </span>
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <span className={styles.footerText}>Don&apos;t have an account?</span>
            <Link href="/signup" className={styles.link}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
