"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { useToast } from "./Toast";

export default function RegisterForm() {
  const router = useRouter();
  const { refresh } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "seeker" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sign up failed");
        toast.error(data.error || "Sign up failed");
        return;
      }
      toast.success("Account created — welcome!");
      await refresh();
      router.push(form.role === "owner" ? "/dashboard" : "/rooms");
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
      <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-1 text-sm text-ink-muted">Start finding (or listing) rooms in Srinagar Garhwal.</p>
      <form onSubmit={submit} className="mt-6 space-y-4" id="register-form">
        <div>
          <label className="label">I am a…</label>
          <div className="grid grid-cols-2 gap-2">
            <RoleButton
              on={form.role === "seeker"}
              onClick={() => setForm({ ...form, role: "seeker" })}
              hint="Browse rooms, save favourites, contact owners"
            >
              Looking for a room
            </RoleButton>
            <RoleButton
              on={form.role === "owner"}
              onClick={() => setForm({ ...form, role: "owner" })}
              hint="List rooms, manage availability, get enquiries"
            >
              Room owner
            </RoleButton>
          </div>
        </div>
        <div>
          <label className="label">Full name</label>
          <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone (10 digit)</label>
            <input
              className="input" required pattern="[0-9]{10}"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required minLength={6} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <p className="mt-1 text-[11px] text-ink-subtle">At least 6 characters</p>
        </div>
        {error && (
          <div className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <button disabled={loading} className="btn-primary w-full">
          {loading ? <><span className="spinner" /> Creating account…</> : "Create account"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link className="font-semibold text-ink hover:text-accent-dark underline underline-offset-4" href="/login">
          Login
        </Link>
      </p>
    </div>
  );
}

function RoleButton({ on, onClick, children, hint }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-1 rounded-[10px] border px-3 py-2.5 text-left text-sm font-semibold transition ${
        on
          ? "border-accent bg-accent-light text-accent-dark shadow-soft"
          : "border-line bg-canvas-card text-ink-muted hover:border-ink/20 hover:text-ink"
      }`}
    >
      <span>{children}</span>
      {hint && (
        <span
          className={`text-[11px] font-medium leading-snug ${
            on ? "text-accent-dark/80" : "text-ink-subtle"
          }`}
        >
          {hint}
        </span>
      )}
    </button>
  );
}
