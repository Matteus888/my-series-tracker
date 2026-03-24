"use client";
import styles from "@/app/login/page.module.css";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className={styles.container}>
      <div className={`${styles.loginCard} card`}>
        <h1 className={styles.loginTitle}>Connection</h1>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
              placeholder="your@email.com"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={isLoading} className="btn">
            {isLoading ? "Connecting..." : "Log In"}
          </button>
        </form>

        <div className={styles.formFooter}>
          <p className={styles.mutedText}>
            Don&#39;t have an account yet?{" "}
            <Link href="/signup" className={styles.signupLink}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
