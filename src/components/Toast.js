"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ToastCtx = createContext(null);

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((opts) => {
    const id = ++_id;
    const t = {
      id,
      type: opts.type || "info",
      title: opts.title || "",
      message: opts.message || (typeof opts === "string" ? opts : ""),
      duration: opts.duration ?? 3500,
    };
    setToasts((arr) => [...arr, t]);
    if (t.duration > 0) setTimeout(() => remove(id), t.duration);
    return id;
  }, [remove]);

  const api = {
    show: push,
    success: (m, title) => push({ type: "success", message: m, title }),
    error:   (m, title) => push({ type: "error",   message: m, title }),
    info:    (m, title) => push({ type: "info",    message: m, title }),
    dismiss: remove,
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div
        id="toast-region"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const styles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    error:   "bg-red-50 border-red-200 text-red-900",
    info:    "bg-canvas-card border-line text-ink",
  };
  const icon = {
    success: "✓",
    error:   "!",
    info:    "i",
  }[toast.type];
  const iconBg = {
    success: "bg-emerald-500 text-white",
    error:   "bg-red-500 text-white",
    info:    "bg-ink text-canvas",
  }[toast.type];

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-3 rounded-[12px] border px-4 py-3 shadow-lift animate-slide-up ${styles[toast.type]}`}
      data-testid={`toast-${toast.type}`}
    >
      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${iconBg}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1 text-sm leading-snug">
        {toast.title && <p className="font-semibold">{toast.title}</p>}
        {toast.message && <p className={toast.title ? "mt-0.5 opacity-80" : ""}>{toast.message}</p>}
      </div>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="shrink-0 text-current opacity-50 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    // Safe no-op fallback in case provider is missing
    return {
      show: () => {}, success: () => {}, error: () => {}, info: () => {}, dismiss: () => {},
    };
  }
  return ctx;
}
