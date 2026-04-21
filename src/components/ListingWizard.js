"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";

const LOCALITIES = ["HNBGU Campus", "Bada Bazaar", "Parasnath Colony", "Bus Stand", "Chaura Maidan", "Gauchar Road"];
const ROOM_TYPES = ["Single", "Double", "Shared", "PG", "1BHK", "2BHK"];
const GENDERS = ["Male", "Female", "Any"];
const AMENITIES = ["WiFi", "Hot Water", "Parking", "Furnished", "Attached Bathroom", "Kitchen", "Power Backup", "Water Tank", "Balcony", "Study Table"];

const STEPS = [
  { key: "details", label: "Details" },
  { key: "price",   label: "Price & contact" },
  { key: "amen",    label: "Amenities" },
  { key: "photos",  label: "Photos" },
  { key: "review",  label: "Review" },
];

export default function ListingWizard({ mode, roomId, initial, defaultOwner }) {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState(
    initial
      ? {
          // Pre-fill cleanly from existing room
          title: initial.title || "",
          description: initial.description || "",
          locality: initial.locality || LOCALITIES[0],
          roomType: initial.roomType || ROOM_TYPES[0],
          gender: initial.gender || "Any",
          price: initial.price ?? 3000,
          amenities: Array.isArray(initial.amenities) ? initial.amenities : [],
          images: Array.isArray(initial.images) ? initial.images : [],
          ownerName: initial.ownerName || "",
          ownerPhone: initial.ownerPhone || "",
          available: initial.available !== false,
        }
      : {
          title: "",
          description: "",
          locality: LOCALITIES[0],
          roomType: ROOM_TYPES[0],
          gender: "Any",
          price: 3000,
          amenities: [],
          images: [],
          ownerName: defaultOwner?.name || "",
          ownerPhone: defaultOwner?.phone || "",
          available: true,
        }
  );

  function setField(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function validateStep(idx = step) {
    if (idx === 0) {
      if (!form.title.trim()) return "Title is required";
      if (form.title.trim().length < 5) return "Title is too short (min 5 chars)";
      if (!form.description || form.description.trim().length < 20) return "Add a description (20+ characters)";
      if (!form.locality) return "Choose a locality";
      if (!form.roomType) return "Choose a room type";
    }
    if (idx === 1) {
      if (!form.price || Number(form.price) < 500) return "Enter a valid price (≥ ₹500)";
      if (!form.ownerName.trim()) return "Owner name is required";
      if (!/^\d{10}$/.test(form.ownerPhone)) return "Enter a valid 10-digit phone number";
    }
    if (idx === 2) {
      // amenities optional
    }
    if (idx === 3) {
      if (!form.images || form.images.length === 0) return "Add at least one photo of the room";
    }
    return "";
  }

  function next() {
    const e = validateStep();
    if (e) { setError(e); toast.error(e); return; }
    setError("");
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }
  function back() { setError(""); setStep((s) => Math.max(0, s - 1)); }
  function goTo(i) {
    if (i <= step) { setError(""); setStep(i); return; }
    // Validate all preceding steps before jumping forward
    for (let s = 0; s < i; s++) {
      const e = validateStep(s);
      if (e) { setError(e); toast.error(e); setStep(s); return; }
    }
    setStep(i);
  }

  async function uploadOne(file) {
    const dataUri = await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
    const r = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUri }),
    });
    return r.json();
  }

  async function handleFiles(files) {
    if (!files || files.length === 0) return;
    const remaining = 6 - form.images.length;
    if (remaining <= 0) {
      toast.info("You can upload up to 6 photos.");
      return;
    }
    const arr = Array.from(files).slice(0, remaining);
    setUploading(true);
    let successCount = 0;
    for (const file of arr) {
      try {
        const d = await uploadOne(file);
        if (d.url) {
          setForm((f) => ({ ...f, images: [...f.images, d.url] }));
          successCount += 1;
        } else {
          toast.error(d.error || "Upload failed");
        }
      } catch {
        toast.error("Upload failed for one image");
      }
    }
    setUploading(false);
    if (successCount > 0) toast.success(`${successCount} photo${successCount > 1 ? "s" : ""} uploaded`);
  }

  function removeImage(i) {
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
  }

  function moveImage(from, to) {
    setForm((f) => {
      const next = [...f.images];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return { ...f, images: next };
    });
  }

  async function submit() {
    // Validate all steps before submitting
    for (let s = 0; s < STEPS.length - 1; s++) {
      const e = validateStep(s);
      if (e) { setError(e); toast.error(e); setStep(s); return; }
    }
    setSubmitting(true);
    setError("");
    try {
      const url = mode === "edit" ? `/api/rooms/${roomId}` : "/api/rooms";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
        toast.error(data.error || "Failed to save");
        return;
      }
      toast.success(mode === "edit" ? "Listing updated" : "Listing published");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error — please retry");
    } finally {
      setSubmitting(false);
    }
  }

  const progressPct = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  return (
    <div className="card p-6 sm:p-8" id="listing-wizard">
      {/* Stepper */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-muted">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{progressPct}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas-soft">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <ol className="mb-7 mt-5 flex flex-wrap gap-1.5 text-xs font-semibold">
        {STEPS.map((s, i) => {
          const state = i === step ? "current" : i < step ? "done" : "todo";
          return (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => goTo(i)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition ${
                  state === "current" ? "bg-ink text-canvas"
                  : state === "done" ? "bg-accent-light text-accent-dark hover:bg-accent-light/80"
                  : "bg-canvas-soft text-ink-muted hover:bg-line"
                }`}
              >
                <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${
                  state === "current" ? "bg-canvas/20" : state === "done" ? "bg-canvas-card" : "bg-canvas-card"
                }`}>
                  {state === "done" ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Step content */}
      <div className="animate-fade-in">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="label">Title</label>
              <input
                className="input" value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="e.g. Single furnished room near HNBGU gate"
              />
              <Counter value={form.title} min={5} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                className="input min-h-[140px] leading-relaxed"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Describe the room, surroundings, rules, deposit, what's nearby…"
              />
              <Counter value={form.description} min={20} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Locality</label>
                <select className="input" value={form.locality} onChange={(e) => setField("locality", e.target.value)}>
                  {LOCALITIES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Room type</label>
                <select className="input" value={form.roomType} onChange={(e) => setField("roomType", e.target.value)}>
                  {ROOM_TYPES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Preferred gender</label>
                <select className="input" value={form.gender} onChange={(e) => setField("gender", e.target.value)}>
                  {GENDERS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="label">Monthly rent (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">₹</span>
                <input
                  className="input pl-7" type="number" min={500}
                  value={form.price}
                  onChange={(e) => setField("price", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Owner name</label>
                <input className="input" value={form.ownerName} onChange={(e) => setField("ownerName", e.target.value)} />
              </div>
              <div>
                <label className="label">Owner phone (10 digit)</label>
                <input
                  className="input" pattern="[0-9]{10}" inputMode="numeric"
                  value={form.ownerPhone}
                  onChange={(e) => setField("ownerPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210"
                />
              </div>
            </div>
            <label className="flex items-center gap-2.5 rounded-[10px] border border-line bg-canvas-soft/60 p-3.5 text-sm cursor-pointer">
              <input
                type="checkbox" checked={form.available}
                onChange={(e) => setField("available", e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              <span><strong>Available now</strong> — show this listing to room seekers.</span>
            </label>
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="label">Pick the amenities included</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AMENITIES.map((a) => {
                const on = form.amenities.includes(a);
                return (
                  <button
                    key={a} type="button"
                    onClick={() => setField("amenities", on ? form.amenities.filter((x) => x !== a) : [...form.amenities, a])}
                    className={`rounded-[10px] border px-3 py-2.5 text-sm font-medium transition ${
                      on
                        ? "border-accent bg-accent-light text-accent-dark shadow-soft"
                        : "border-line bg-canvas-card text-ink-muted hover:border-ink/20 hover:text-ink"
                    }`}
                  >
                    {on ? "✓ " : ""}{a}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <PhotoDropzone
              onFiles={handleFiles}
              uploading={uploading}
              count={form.images.length}
              max={6}
            />
            {form.images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {form.images.map((src, i) => (
                  <div
                    key={src + i}
                    className="group relative aspect-square overflow-hidden rounded-[12px] border border-line bg-canvas-soft shadow-soft"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {i === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-canvas">
                        Cover
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-ink/80 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                      <div className="flex gap-1">
                        <button
                          type="button" onClick={() => i > 0 && moveImage(i, i - 1)}
                          disabled={i === 0}
                          className="grid h-7 w-7 place-items-center rounded-md bg-canvas/90 text-ink hover:bg-canvas disabled:opacity-30"
                          aria-label="Move left"
                        >‹</button>
                        <button
                          type="button" onClick={() => i < form.images.length - 1 && moveImage(i, i + 1)}
                          disabled={i === form.images.length - 1}
                          className="grid h-7 w-7 place-items-center rounded-md bg-canvas/90 text-ink hover:bg-canvas disabled:opacity-30"
                          aria-label="Move right"
                        >›</button>
                      </div>
                      <button
                        type="button" onClick={() => removeImage(i)}
                        className="grid h-7 w-7 place-items-center rounded-md bg-red-600 text-white hover:bg-red-700"
                        aria-label="Remove"
                      >✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-ink-subtle">
              Tip: the first image is used as the cover photo. Drag the reorder arrows to change.
            </p>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h3 className="text-base font-bold tracking-tight">Review your listing</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field k="Title" v={form.title} />
              <Field k="Price" v={`₹${Number(form.price).toLocaleString("en-IN")} / month`} accent />
              <Field k="Locality" v={form.locality} />
              <Field k="Type" v={form.roomType} />
              <Field k="Preferred gender" v={form.gender} />
              <Field k="Photos" v={`${form.images.length} uploaded`} />
              <Field k="Owner" v={`${form.ownerName} (+91 ${form.ownerPhone})`} />
              <Field k="Amenities" v={form.amenities.join(", ") || "—"} />
            </div>
            <div className="card bg-canvas-soft/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Description</p>
              <p className="mt-2 whitespace-pre-line text-sm text-ink">{form.description}</p>
            </div>
            <p className="rounded-[10px] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              By submitting, you confirm the details are accurate.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-5 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-7 flex items-center justify-between border-t border-line pt-5">
        <button
          type="button" onClick={back} disabled={step === 0 || submitting}
          className="btn-outline disabled:opacity-50"
        >
          ← Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={next} className="btn-primary" id="wizard-next">
            Next →
          </button>
        ) : (
          <button
            type="button" onClick={submit} disabled={submitting}
            className="btn-accent" id="wizard-submit"
          >
            {submitting
              ? <><span className="spinner" /> Saving…</>
              : mode === "edit" ? "Save changes" : "Publish listing"}
          </button>
        )}
      </div>
    </div>
  );
}

function Counter({ value, min }) {
  const len = (value || "").length;
  const ok = len >= min;
  return (
    <p className={`mt-1 text-[11px] ${ok ? "text-emerald-700" : "text-ink-subtle"}`}>
      {len}/{min} characters {ok && "·  ✓"}
    </p>
  );
}

function Field({ k, v, accent }) {
  return (
    <div className="rounded-[10px] border border-line bg-canvas-card px-3.5 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{k}</p>
      <p className={`mt-0.5 truncate font-semibold ${accent ? "text-accent-dark" : "text-ink"}`}>{v || "—"}</p>
    </div>
  );
}

function PhotoDropzone({ onFiles, uploading, count, max }) {
  const [drag, setDrag] = useState(false);
  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed px-6 py-10 text-center transition ${
        drag
          ? "border-accent bg-accent-light"
          : "border-line bg-canvas-soft/40 hover:border-accent hover:bg-accent-light/50"
      }`}
    >
      <input
        type="file" accept="image/*" multiple
        onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }}
        className="sr-only"
      />
      {uploading ? (
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span className="spinner h-5 w-5" /> Uploading…
        </div>
      ) : (
        <>
          <div className="grid h-12 w-12 place-items-center rounded-full bg-accent-light text-accent-dark text-xl">↑</div>
          <p className="mt-3 text-sm font-semibold text-ink">
            Drop photos here or click to browse
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            JPG, PNG · {count}/{max} uploaded · up to {max} photos
          </p>
        </>
      )}
    </label>
  );
}
