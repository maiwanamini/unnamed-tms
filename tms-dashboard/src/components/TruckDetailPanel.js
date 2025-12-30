"use client";

import CloseIcon from "@mui/icons-material/Close";
import TruckStatusPill from "@/components/TruckStatusPill";
import { formatDateDDMMYYYY } from "@/lib/date";
import { prettyTruckType } from "@/lib/vehicle";
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

export default function TruckDetailPanel({ selected, onClose, onEdit, onDelete, deleting }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = () => {
    if (deleting) return;
    onDelete?.();
    setConfirmOpen(false);
  };

  if (!selected) return null;

  return (
    <aside className="detail-panel">
      <div className="header">
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <h3 style={{ margin: 0, fontSize: 22 }}>{selected?.licensePlate || "Truck"}</h3>
            {prettyTruckType(selected?.type) ? <div style={{ color: "#9ca3af", fontSize: 14 }}>{prettyTruckType(selected?.type)}</div> : null}
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
        <Row label="Type" value={prettyTruckType(selected?.type) || selected?.type} />
        <Row label="Model" value={selected?.truck} />
        <Row label="Year" value={selected?.modelYear ?? ""} />
        <Row label="Driver" value={selected?.driverName} />
        <Row label="Trailer" value={selected?.trailerName} />
        <Row label="Created" value={formatDateDDMMYYYY(selected?.createdAt) || ""} />
      </div>

      {confirmOpen ? (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>Delete truck</div>
          <div style={{ marginTop: 8, color: "#475569", fontSize: 14, lineHeight: 1.4 }}>
            Are you sure you want to delete this truck? This cannot be undone.
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button type="button" className="btn-outline" onClick={() => setConfirmOpen(false)} style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleDelete}
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
          <button type="button" className="btn-primary" onClick={() => setConfirmOpen(true)} style={{ flex: 1 }}>
            Delete
          </button>
        </div>
      )}
    </aside>
  );
}
