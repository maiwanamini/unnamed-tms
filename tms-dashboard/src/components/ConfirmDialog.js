"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message = "Are you sure?",
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  confirmDisabled = false,
  scope = "screen", // "screen" | "panel"
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onCancel?.();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;


  const content = (
    <div
      className={`confirm-backdrop${scope === "panel" ? " confirm-backdrop--panel" : ""}`}
      role="dialog"
      aria-modal="true"
      onMouseDown={() => onCancel?.()}
    >
      <div className="confirm-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="confirm-title">{title}</div>
        <div className="confirm-message">{message}</div>
        <div className="confirm-actions">
          <button type="button" className="btn-outline" onClick={() => onCancel?.()}>
            {cancelLabel}
          </button>
          <button type="button" className="btn-primary" onClick={() => onConfirm?.()} disabled={confirmDisabled}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  if (scope === "screen" && typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
}
