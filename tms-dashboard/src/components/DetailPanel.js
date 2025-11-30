"use client";

import PersonIcon from '@mui/icons-material/Person';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MapIcon from '@mui/icons-material/Map';
import NoteIcon from '@mui/icons-material/Note';
import StatusPill from "@/components/StatusPill";
import StopCard from '@/components/StopCard';
import { useState, useEffect } from 'react';

export default function DetailPanel({ selected }) {
  const [stops, setStops] = useState(selected?.stops || [
    { id: 1, type: 'pickup', title: 'Address Name', address: 'Address', ref: '#Reference', time: 'Date, Time', note: 'Notes', status: 'Completed' },
    { id: 2, type: 'dropoff', title: 'Address Name', address: 'Address', ref: '#Reference', time: 'Date, Time', note: 'Notes', status: 'En route' },
    { id: 3, type: 'dropoff', title: 'Address Name', address: 'Address', ref: '#Reference', time: 'Date, Time', note: 'Notes', status: 'Pending' },
  ]);

  useEffect(() => {
    if (selected?.stops) setStops(selected.stops);
  }, [selected]);

  const flagClass = (s) => (s === 'Completed' ? 'completed' : (s === 'En route' || s === 'Moving') ? 'moving' : 'pending');

  return (
    <aside className="detail-panel">
      <div className="header">
        <div>
          <h3 style={{ margin: 0, fontSize: 22 }}>{selected?.id || 'O-01'}</h3>
          <p style={{ marginTop: 6 }}>{selected?.client || 'Client name'}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <StatusPill status={selected?.status || 'Moving'} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#6b7280", fontSize: 13 }}>Plate</div>
          <div style={{ fontWeight: 600, marginTop: 6 }}>Truck</div>
        </div>
        <div className="plate-actions">
          <button className="small-ghost"><SwapHorizIcon /></button>
          <button className="small-ghost"><CloseIcon /></button>
        </div>
      </div>

      <div style={{ marginTop: 6, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 99, background: "#111827", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><PersonIcon /></div>
          <div>
            <div style={{ fontWeight: 600 }}>Driver</div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>Phone</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <button className="assign-btn">ASSIGN TRAILER</button>
      </div>

      <h4 style={{ marginTop: 8, marginBottom: 8 }}>Stops</h4>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ color: "#6b7280", fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}><MapIcon /> <span>20km</span></div>
        <StatusPill status={selected?.status || 'Moving'} />
      </div>

      <div>
        {stops.map((s) => (
          <StopCard key={s.id} stop={s} />
        ))}
      </div>
    </aside>
  );
}
