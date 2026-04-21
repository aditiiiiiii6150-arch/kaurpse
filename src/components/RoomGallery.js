"use client";
import { useEffect, useState } from "react";

const FALLBACK = "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1600&auto=format&fit=crop";

export default function RoomGallery({ images = [], title }) {
  const list = images.length > 0 ? images : [FALLBACK];
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e) {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % list.length);
      if (e.key === "ArrowLeft")  setActive((i) => (i - 1 + list.length) % list.length);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, list.length]);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[1fr_120px]" id="room-gallery">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="group relative aspect-[16/10] overflow-hidden rounded-[14px] bg-canvas-soft shadow-soft"
          aria-label="Open photo viewer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={list[active]}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-semibold text-canvas opacity-0 backdrop-blur transition group-hover:opacity-100">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 5V2h3M10 7v3H7M2 7v3h3M10 5V2H7" />
            </svg>
            View {list.length} photo{list.length > 1 ? "s" : ""}
          </span>
        </button>

        <div className="flex gap-2 sm:flex-col">
          {list.slice(0, 5).map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`aspect-square w-20 shrink-0 overflow-hidden rounded-[10px] border-2 transition sm:w-full ${
                i === active ? "border-accent shadow-soft" : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`Show photo ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/90 px-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(false)}
          data-testid="lightbox"
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(false); }}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-canvas/10 text-canvas hover:bg-canvas/20"
          >
            ✕
          </button>

          {list.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActive((i) => (i - 1 + list.length) % list.length); }}
                aria-label="Previous"
                className="absolute left-4 grid h-12 w-12 place-items-center rounded-full bg-canvas/10 text-canvas hover:bg-canvas/20"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActive((i) => (i + 1) % list.length); }}
                aria-label="Next"
                className="absolute right-4 grid h-12 w-12 place-items-center rounded-full bg-canvas/10 text-canvas hover:bg-canvas/20 md:right-20"
              >
                ›
              </button>
            </>
          )}

          <div
            className="relative max-h-[90vh] max-w-[92vw] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={list[active]}
              alt={title}
              className="max-h-[90vh] w-auto rounded-[12px] object-contain"
            />
            <div className="mt-3 text-center text-xs font-medium text-canvas/80">
              {active + 1} / {list.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
