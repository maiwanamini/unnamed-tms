"use client";

import CloseIcon from "@mui/icons-material/Close";
import TruckStatusPill from "@/components/TruckStatusPill";
import { formatDateDDMMYYYY } from "@/lib/date";
import AvatarCircle from "@/components/AvatarCircle";
import { useState } from "react";

function Row({ label, value, right }) {
  const v = value == null ? "" : String(value);
  const align = right ? "center" : "flex-start";
  return (
    <div style={{ display: "flex", alignItems: align, gap: 12, padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
      <strong style={{ width: 110, flexShrink: 0, color: "#111827" }}>{label}</strong>
      <div
        style={{
          color: "#111827",
          minWidth: 0,
          wordBreak: "break-word",
          display: right ? "flex" : undefined,
          alignItems: right ? "center" : undefined,
        }}
      >
        {right ?? (v || "")}
      </div>
    </div>
  );
}

export default function DriverDetailPanel({ selected, onClose, onEdit, onDelete, deleting }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!selected) return null;

  return (
    <aside className="detail-panel">
      <div className="header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <AvatarCircle src={selected?.avatarUrl} name={selected?.fullName} seed={selected?.id} size={44} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selected?.fullName || ""}
            </div>
          </div>
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
        <Row label="Status" right={<TruckStatusPill status={selected?.status} />} />
        <Row label="Phone" value={selected?.phone} />
        <Row label="Email" value={selected?.email} />
        <Row label="Truck" value={selected?.truckName} />
        <Row label="Created" value={formatDateDDMMYYYY(selected?.createdAt) || ""} />
      </div>

      {confirmOpen ? (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>Delete driver</div>
          <div style={{ marginTop: 8, color: "#475569", fontSize: 14, lineHeight: 1.4 }}>
            Are you sure you want to delete this driver? This cannot be undone.
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button type="button" className="btn-outline" onClick={() => setConfirmOpen(false)} style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={() => {
                onDelete?.();
                setConfirmOpen(false);
              }}
              disabled={Boolean(deleting)}
              style={{ flex: 1 }}
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button type="button" className="btn-outline" onClick={() => onEdit?.()} style={{ flex: 1 }}>
            Edit
          </button>
          <button type="button" className="btn-danger" onClick={() => setConfirmOpen(true)} style={{ flex: 1 }}>
            Delete
          </button>
        </div>
      )}
    </aside>
  );
}
