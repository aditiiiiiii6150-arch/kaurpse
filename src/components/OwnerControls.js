"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";

export default function OwnerControls({ roomId, initialAvailable }) {
  const router = useRouter();
  const toast = useToast();
  const [available, setAvailable] = useState(Boolean(initialAvailable));
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const next = !available;
    setAvailable(next);
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Listing is now ${next ? "visible" : "hidden"}`);
      router.refresh();
    } catch {
      setAvailable(!next);
      toast.error("Could not update — try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      id="owner-controls"
      className="card flex flex-col gap-3 border-accent/40 bg-accent-light/40 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-ink text-sm font-bold">
          ★
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-dark">
            Owner controls
          </p>
          <p className="text-sm text-ink-muted">
            You own this listing. Quick actions — no need to go back to the dashboard.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={toggle}
          disabled={busy}
          aria-pressed={available}
          data-testid="owner-availability-toggle"
          className={`btn ${
            available
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-canvas-card text-ink-muted border border-line hover:bg-canvas-soft"
          } btn-sm`}
        >
          {busy && <span className="spinner h-3 w-3" />}
          <span className={`h-1.5 w-1.5 rounded-full ${available ? "bg-white" : "bg-ink-subtle"}`} />
          {available ? "Available" : "Hidden"}
        </button>
        <Link href={`/dashboard/${roomId}/edit`} className="btn-primary btn-sm" id="owner-edit-btn">
          Edit listing
        </Link>
      </div>
    </div>
  );
}
