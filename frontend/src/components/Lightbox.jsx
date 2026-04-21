import React, { useEffect } from 'react';

export default function Lightbox({ open, images = [], index = 0, onClose, onPrev, onNext }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowRight') onNext?.();
      if (e.key === 'ArrowLeft') onPrev?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose, onNext, onPrev]);

  if (!open || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/90 px-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      data-testid="lightbox"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose?.(); }}
        aria-label="Close"
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white text-lg hover:bg-white/20 transition"
      >
        ✕
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white text-2xl hover:bg-white/20 transition"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext?.(); }}
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white text-2xl hover:bg-white/20 transition"
          >
            ›
          </button>
        </>
      )}

      <div
        className="relative max-h-[90vh] max-w-[92vw] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[index]}
          alt={`Photo ${index + 1}`}
          className="max-h-[90vh] w-auto rounded-[12px] object-contain"
        />
        <div className="mt-3 text-center text-xs font-medium text-white/80">
          {index + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
