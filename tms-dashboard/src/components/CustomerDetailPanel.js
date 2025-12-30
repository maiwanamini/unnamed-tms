"use client";

import CloseIcon from "@mui/icons-material/Close";
import { formatDateDDMMYYYY } from "@/lib/date";
import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";

function formatAddress(addr) {
  if (!addr) return "";
  if (typeof addr === "string") return addr;
  if (typeof addr === "object") {
    const parts = [
      addr.street,
      addr.line1,
      addr.line2,
      addr.city,
      addr.state,
      addr.postalCode,
      addr.zip,
      addr.country,
    ].filter(Boolean);
    return parts.join(", ");
  }
  return String(addr);
}

function Row({ label, value }) {
  const v = value == null ? "" : String(value);
  return (
    <div style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
      <strong style={{ width: 110, flexShrink: 0, color: "#111827" }}>{label}</strong>
      <div style={{ color: "#111827", minWidth: 0, wordBreak: "break-word" }}>{v || ""}</div>
    </div>
  );
}

export default function CustomerDetailPanel({ selected, onClose, onEdit, onDelete, deleting }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!selected) return null;

  return (
    <aside className="detail-panel">
      <ConfirmDialog
        open={confirmOpen}
        title="Delete customer"
        message="Are you sure you want to delete this customer? This cannot be undone."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        confirmDisabled={Boolean(deleting)}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          onDelete?.();
          setConfirmOpen(false);
        }}
      />

      <div className="header">
        <div>
          <h3 style={{ margin: 0, fontSize: 22 }}>{selected?.name || "Customer"}</h3>
        </div>

        <button
          type="button"
          className="small-ghost close-detail"
          aria-label="Close details"
          onClick={() => onClose?.()}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="detail-divider" />

      <div className="detail-list">
        <Row label="Contact" value={selected?.contactName} />
        <Row label="Phone" value={selected?.phone} />
        <Row label="Email" value={selected?.email} />
        <Row label="Address" value={formatAddress(selected?.address)} />
        <Row label="Created" value={formatDateDDMMYYYY(selected?.createdAt || selected?.created_at) || ""} />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button type="button" className="btn-outline" onClick={() => onEdit?.()} style={{ flex: 1 }}>
          Edit
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setConfirmOpen(true)}
          disabled={Boolean(deleting)}
          style={{ flex: 1 }}
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </aside>
  );
}
