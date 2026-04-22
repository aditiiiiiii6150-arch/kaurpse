"use client";
import { useState } from "react";
import RoomCard from "./RoomCard";
import { useToast } from "./Toast";

export default function RoomList({ initialRooms, initialCursor, query, savedIds = [] }) {
  const toast = useToast();
  const [rooms, setRooms] = useState(initialRooms);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(new Set(savedIds));

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams(query || {});
      params.set("cursor", cursor);
      const res = await fetch(`/api/rooms?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setRooms((prev) => [...prev, ...(data.rooms || [])]);
      setCursor(data.nextCursor || null);
    } catch (e) {
      toast.error(e.message || "Could not load more rooms");
    } finally {
      setLoading(false);
    }
  }

  function onToggleSave(id, nowSaved) {
    setSaved((prev) => {
      const next = new Set(prev);
      if (nowSaved) next.add(String(id));
      else next.delete(String(id));
      return next;
    });
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" id="rooms-grid">
        {rooms.map((r) => (
          <RoomCard
            key={r._id.toString()}
            room={r}
            saved={saved.has(String(r._id))}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
      {cursor && (
        <div className="mt-8 flex justify-center">
          <button
            id="load-more-btn"
            onClick={loadMore}
            disabled={loading}
            className="btn-outline"
          >
            {loading ? <><span className="spinner" /> Loading…</> : "Load more"}
          </button>
        </div>
      )}
      {!cursor && rooms.length > 0 && (
        <p className="mt-8 text-center text-xs text-ink-subtle">
          You&apos;ve reached the end · {rooms.length} room{rooms.length === 1 ? "" : "s"}
        </p>
      )}
    </>
  );
}
