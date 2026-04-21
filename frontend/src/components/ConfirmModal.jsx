import React, { useEffect } from 'react';

export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape' && !loading) onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, loading, onClose]);

  if (!open) return null;
  const confirmCls = variant === 'danger' ? 'btn-danger' : 'btn-primary';

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center px-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      data-testid="confirm-modal"
    >
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={() => !loading && onClose?.()}
      />
      <div className="relative w-full max-w-sm rounded-[16px] border border-line bg-canvas-card p-6 shadow-lift animate-scale-in">
        <div className="flex items-start gap-3">
          {variant === 'danger' && (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600 text-lg font-bold">!</span>
          )}
          <div className="flex-1">
            <h3 id="confirm-title" className="text-base font-semibold text-ink">{title}</h3>
            <p className="mt-1 text-sm text-ink-muted">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={confirmCls}
            data-testid="confirm-btn"
          >
            {loading ? <span className="spinner" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
