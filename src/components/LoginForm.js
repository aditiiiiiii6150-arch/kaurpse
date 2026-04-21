"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { useToast } from "./Toast";

export default function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next");
  const { refresh } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        toast.error(data.error || "Login failed");
        return;
      }
      toast.success(`Welcome back, ${data.user.name?.split(" ")[0] || ""}`);
      await refresh();
      router.push(next || (data.user.role === "owner" ? "/dashboard" : "/rooms"));
      router.refresh();
    } catch {
      setError("Network error — please try again");
      toast.error("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-7">
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-muted">Login to your BASERA account.</p>
      <form onSubmit={submit} className="mt-6 space-y-4" id="login-form">
        <div>
          <label className="label">Email</label>
          <input
            className="input" type="email" required autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input" type="password" required autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {error && (
          <div className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <button disabled={loading} className="btn-primary w-full">
          {loading ? <><span className="spinner" /> Signing in…</> : "Login"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-ink-muted">
        New here?{" "}
        <Link className="font-semibold text-ink hover:text-accent-dark underline underline-offset-4" href="/register">
          Create an account
        </Link>
      </p>
    </div>
  );
}
