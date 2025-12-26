"use client";

import PersonIcon from '@mui/icons-material/Person';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RouteIcon from '@mui/icons-material/Route';
import NoteIcon from '@mui/icons-material/Note';
import StatusPill from "@/components/StatusPill";
import StopCard from '@/components/StopCard';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export default function DetailPanel({ selected }) {
  const stops = selected?.stops || [
    { id: 1, type: 'pickup', title: 'Address Name', address: 'Address', ref: '#Reference', time: 'Date, Time', note: 'Notes', status: 'Completed' },
    { id: 2, type: 'dropoff', title: 'Address Name', address: 'Address', ref: '#Reference', time: 'Date, Time', note: 'Notes', status: 'Moving' },
    { id: 3, type: 'dropoff', title: 'Address Name', address: 'Address', ref: '#Reference', time: 'Date, Time', note: 'Notes', status: 'Pending' },
    { id: 4, type: 'dropoff', title: 'Address Name', address: 'Address', ref: '#Reference', time: 'Date, Time', note: 'Notes', status: 'Canceled' },
  ];

  const driverName = selected?.driver && selected.driver !== "Driver" ? String(selected.driver) : "";
  const driverPhone = selected?.driverPhone ? String(selected.driverPhone) : "";
  const driverAvatarUrl = selected?.driverAvatarUrl ? String(selected.driverAvatarUrl) : "";
  const driverInitials = driverName
    ? driverName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("")
    : "";

  return (
    <aside className="detail-panel">
      <div className="header">
        <div>
          <h3 style={{ margin: 0, fontSize: 22 }}>{selected?.id || 'O-01'}</h3>
        </div>
      </div>

    <div className="detail-divider" style={{ height: 1, width: '100%', background: '#e5e7eb', marginTop: 16, marginBottom: 16 }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Truck</div>
          <div style={{ color: "#6b7280", fontSize: 14 }}>Plate</div>
        </div>
        <div className="plate-actions">
          <button className="small-ghost change-truck" data-tooltip="Change truck" aria-label="Change truck"><SwapHorizIcon /></button>
          <button className="small-ghost unassign-truck" data-tooltip="Unassign truck" aria-label="Unassign truck"><CloseIcon /></button>
        </div>
      </div>

      <div>
        <button className="assign-btn">ASSIGN TRAILER</button>
      </div>

      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 99,
              background: "#111827",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {driverAvatarUrl ? (
              <img src={driverAvatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : driverInitials ? (
              <span style={{ fontWeight: 700, fontSize: 14 }}>{driverInitials}</span>
            ) : (
              <PersonIcon />
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{driverName || "Driver"}</div>
            <div style={{ color: "#6b7280", fontSize: 14 }}>{driverPhone || ""}</div>
          </div>
        </div>
      </div>

      <div className="detail-divider" style={{ height: 1, width: '100%', background: '#e5e7eb', marginTop: 16, marginBottom: 16 }} />

      <h4 style={{ marginTop: 8, marginBottom: 8 }}>Stops</h4>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div className="route-pill">
          <RouteIcon className="route-icon" />
          <span className="route-text">20km</span>
        </div>
        <StatusPill status={selected?.status || 'Moving'} />
      </div>

      <div>
        {stops.map((s, idx) => (
          <div key={s.id}>
            <StopCard stop={s} index={idx + 1} />
            {idx < stops.length - 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '12px 0' }}>
                <ArrowDownwardIcon style={{ fontSize: 20, color: '#9ca3af' }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
