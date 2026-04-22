"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/rooms${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      id="hero-search"
      className="mt-7 flex w-full max-w-xl items-center gap-2 rounded-[14px] border border-line bg-canvas-card p-1.5 shadow-soft"
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center text-ink-muted">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </div>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search rooms — e.g. furnished near HNBGU"
        className="input border-0 bg-transparent shadow-none focus:ring-0 focus:border-0 px-0 py-2"
        aria-label="Search rooms"
      />
      <button type="submit" className="btn-primary shrink-0">
        Search
      </button>
    </form>
  );
}
