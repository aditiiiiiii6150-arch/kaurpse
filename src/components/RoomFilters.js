"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const EMPTY = { q: "", locality: "", roomType: "", gender: "", minPrice: "", maxPrice: "" };

export default function RoomFilters({ options, initial }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [f, setF] = useState({ ...EMPTY, ...initial });

  // Keep state in sync if URL changes externally (e.g. user clicks a locality link)
  useEffect(() => {
    setF({ ...EMPTY, ...initial });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initial)]);

  const activeCount = Object.entries(f).filter(([, v]) => v && String(v).length > 0).length;

  function pushUrl(state) {
    const params = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) params.set(k, v);
    });
    startTransition(() => {
      router.push(`/rooms${params.toString() ? `?${params}` : ""}`);
    });
  }

  function apply(e) {
    e?.preventDefault();
    pushUrl(f);
  }

  function clear() {
    setF(EMPTY);
    startTransition(() => router.push("/rooms"));
  }

  return (
    <form
      onSubmit={apply}
      className="card sticky top-24 space-y-5 p-5"
      id="room-filters"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-ink">Filters</h3>
        {activeCount > 0 && (
          <span className="rounded-full bg-accent-light px-2 py-0.5 text-[11px] font-semibold text-accent-dark">
            {activeCount} active
          </span>
        )}
      </div>

      <div>
        <label className="label">Search</label>
        <input
          className="input"
          placeholder="title, keyword…"
          value={f.q}
          onChange={(e) => setF({ ...f, q: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Locality</label>
        <select className="input" value={f.locality} onChange={(e) => setF({ ...f, locality: e.target.value })}>
          <option value="">All localities</option>
          {options.localities.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Room type</label>
        <select className="input" value={f.roomType} onChange={(e) => setF({ ...f, roomType: e.target.value })}>
          <option value="">Any type</option>
          {options.roomTypes.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Gender</label>
        <select className="input" value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })}>
          <option value="">Any</option>
          {options.genders.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Min ₹</label>
          <input className="input" type="number" min={0} value={f.minPrice}
            onChange={(e) => setF({ ...f, minPrice: e.target.value })} />
        </div>
        <div>
          <label className="label">Max ₹</label>
          <input className="input" type="number" min={0} value={f.maxPrice}
            onChange={(e) => setF({ ...f, maxPrice: e.target.value })} />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={pending} className="btn-primary flex-1">
          {pending ? <span className="spinner" /> : "Apply filters"}
        </button>
        <button type="button" onClick={clear} className="btn-outline" disabled={activeCount === 0 || pending}>
          Clear
        </button>
      </div>
    </form>
  );
}
