"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useToast } from "./Toast";

export default function SaveButton({
  roomId,
  saved: initialSaved,
  onToggle,
  variant = "icon", // "icon" | "full"
  className = "",
}) {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [saved, setSaved] = useState(Boolean(initialSaved));
  const [busy, setBusy] = useState(false);

  async function toggle(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!user) {
      toast.error("Please log in to save rooms");
      router.push("/login?next=/rooms");
      return;
    }
    setBusy(true);
    const next = !saved;
    setSaved(next);
    try {
      const res = await fetch(`/api/rooms/${roomId}/save`, {
        method: next ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error();
      onToggle?.(roomId, next);
      toast.success(next ? "Saved to your list" : "Removed from saved");
      // notify nav badge
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("basera:saved-changed"));
      }
    } catch {
      setSaved(!next);
      toast.error("Could not update — try again");
    } finally {
      setBusy(false);
    }
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={saved}
        data-testid="save-btn-full"
        className={`btn ${
          saved
            ? "bg-accent-light text-accent-dark border border-accent/40"
            : "btn-outline"
        } ${className}`}
      >
        <BookmarkIcon filled={saved} />
        {saved ? "Saved" : "Save room"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save room"}
      data-testid="save-btn"
      className={`grid h-9 w-9 place-items-center rounded-full bg-canvas-card/95 text-ink shadow-soft backdrop-blur transition hover:bg-canvas-card hover:scale-105 ${
        saved ? "text-accent-dark" : "text-ink"
      } ${className}`}
    >
      <BookmarkIcon filled={saved} />
    </button>
  );
}

function BookmarkIcon({ filled }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
