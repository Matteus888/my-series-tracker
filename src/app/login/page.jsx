"use client";
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
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm w-100" style={{ maxWidth: "420px" }}>
        <div className="card-body p-4">
          <h1 className="h4 fw-bold mb-4 text-center">Connection</h1>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
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
            <div className="mb-4">
              <label htmlFor="password" className="form-label">
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
            <button type="submit" disabled={isLoading} className="btn btn-primary w-100">
              {isLoading ? "Connecting..." : "Log In"}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-muted mb-0">
              Don&#39;t have an account yet?{" "}
              <Link href="/signup" className="ms-1 link-primary text-decoration-none">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
