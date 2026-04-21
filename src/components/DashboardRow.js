"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "./Toast";

export default function DashboardRow({ room }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch(`/api/rooms/${room._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !room.available }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Listing is now ${!room.available ? "visible" : "hidden"}`);
      router.refresh();
    } catch {
      toast.error("Could not update listing");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/rooms/${room._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Listing deleted");
      setConfirmOpen(false);
      router.refresh();
    } catch {
      toast.error("Could not delete listing");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <tr className="transition-colors hover:bg-canvas-soft/60" data-testid="dashboard-row">
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-canvas-soft">
              {room.images?.[0] && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={room.images[0]} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <Link
              href={`/rooms/${room._id}`}
              className="font-semibold text-ink hover:text-accent-dark line-clamp-1"
            >
              {room.title}
            </Link>
          </div>
        </td>
        <td className="px-4 py-3.5 text-ink-muted">{room.locality}</td>
        <td className="px-4 py-3.5 text-ink-muted">{room.roomType}</td>
        <td className="px-4 py-3.5 font-semibold text-accent-dark">₹{room.price.toLocaleString("en-IN")}</td>
        <td className="px-4 py-3.5">
          <button
            onClick={toggle}
            disabled={busy}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
              room.available
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-canvas-soft text-ink-muted hover:bg-line"
            }`}
          >
            {busy && <span className="spinner h-3 w-3" />}
            <span className={`h-1.5 w-1.5 rounded-full ${room.available ? "bg-emerald-500" : "bg-ink-subtle"}`} />
            {room.available ? "Available" : "Hidden"}
          </button>
        </td>
        <td className="px-4 py-3.5 text-right">
          <Link
            href={`/dashboard/${room._id}/edit`}
            className="text-sm font-semibold text-ink hover:text-accent-dark hover:underline underline-offset-4"
          >
            Edit
          </Link>
          <button
            onClick={() => setConfirmOpen(true)}
            className="ml-4 text-sm font-semibold text-red-600 hover:underline underline-offset-4"
            data-testid="delete-btn"
          >
            Delete
          </button>
        </td>
      </tr>

      <ConfirmModal
        open={confirmOpen}
        title="Delete listing?"
        message={`"${room.title}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete listing"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => !deleting && setConfirmOpen(false)}
      />
    </>
  );
}
