"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function RegisterPage() {
  const { register, user, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  if (!isLoading && user) router.replace("/dashboard");
}, [isLoading, user, router]);

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <h1 className="mb-4">Register</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          try {
            await register(email, password);
            router.push("/dashboard");
          } catch (err: any) {
            setError(err.message ?? "Registration failed");
          }
        }}
      >
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="form-text">Min 8 characters (backend rule).</div>
        </div>

        <button className="btn btn-success w-100" type="submit">
          Create account
        </button>

        <div className="mt-3 text-center">
          <a href="/login">Already have an account?</a>
        </div>
      </form>
    </div>
  );
}