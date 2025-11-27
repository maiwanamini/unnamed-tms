"use client";

import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const MOCK_ORDERS = [
  { id: "O-01", client: "Client name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Moving" },
  { id: "O-02", client: "Client name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Moving" },
  { id: "O-03", client: "Client name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Moving" },
  { id: "O-04", client: "Client name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Pending" },
  { id: "O-05", client: "Client name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Pending" },
  { id: "O-06", client: "Client name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Pending" },
  { id: "O-07", client: "Client name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Completed" },
  { id: "O-08", client: "Client name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Completed" },
  { id: "O-09", client: "Client name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Completed" },
  { id: "O-10", client: "Client name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Canceled" },
];

function StatusPill({ status }) {
  const cls =
    status === "Moving"
      ? "status-pill status-moving"
      : status === "Pending"
      ? "status-pill status-pending"
      : status === "Completed"
      ? "status-pill status-completed"
      : "status-pill status-canceled";
  return <span className={cls}>{status}</span>;
}

export default function Page() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(MOCK_ORDERS[1]);

  const filtered = MOCK_ORDERS.filter((o) => {
    if (!query) return true;
    return (
      o.id.toLowerCase().includes(query.toLowerCase()) ||
      o.client.toLowerCase().includes(query.toLowerCase()) ||
      o.driver.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <div style={{ flex: 1 }}>
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0, padding: 16, gap: 8, border: "none", borderBottom: "1px solid #e5e7eb" }}>
        <div className="page-header">
          <h2>Orders</h2>
          <p>Manage and dispatch orders</p>
        </div>
        <button className="btn-primary" style={{ width: 102, height: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: 0, flexShrink: 0 }}><AddIcon style={{ fontSize: 20 }} /><span style={{ fontWeight: 600, fontSize: 14 }}>NEW</span></button>
      </div>

      <div className="dashboard-main">
        <div style={{ flex: 1 }}>
          <div className="card header-card" style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
            <div className="filters-row" style={{ marginTop: 0, marginBottom: 0 }}>
              <div className="filter-wrapper">
                <span className="filter-label">Search</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px", width: 242, height: 40, border: "1px solid #e5e7eb", borderRadius: 4, backgroundColor: "#ffffff" }}>
                  <SearchIcon style={{ fontSize: 20, color: "#9ca3af" }} />
                  <input className="input search" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ marginTop: 0, flex: 1, border: "none", outline: "none", backgroundColor: "transparent", color: "#111827", fontSize: 14 }} />
                </div>
              </div>
              <div style={{ width: 1, height: 40, backgroundColor: "#e5e7eb", alignSelf: "flex-end" }}></div>
              <div className="filter-wrapper">
                <span className="filter-label">Choose Date</span>
                <button className="filter"><span>All</span><KeyboardArrowDownIcon style={{ fontSize: 16, color: "#6b7280" }} /></button>
              </div>
              <div className="filter-wrapper">
                <span className="filter-label">Status</span>
                <button className="filter"><span>All</span><KeyboardArrowDownIcon style={{ fontSize: 16, color: "#6b7280" }} /></button>
              </div>
              <div className="filter-wrapper">
                <span className="filter-label">Client</span>
                <button className="filter"><span>All</span><KeyboardArrowDownIcon style={{ fontSize: 16, color: "#6b7280" }} /></button>
              </div>
              <div className="filter-wrapper">
                <span className="filter-label">Truck</span>
                <button className="filter"><span>All</span><KeyboardArrowDownIcon style={{ fontSize: 16, color: "#6b7280" }} /></button>
              </div>
              <div className="filter-wrapper" style={{ marginLeft: "auto" }}>
                <span className="filter-label">&nbsp;</span>
                <div style={{ height: 40, display: "flex", alignItems: "center", color: "#6b7280", fontSize: 14, gap: 6, cursor: "pointer" }}>
                  CLEAR FILTERS <SettingsIcon style={{ fontSize: 18 }} />
                </div>
              </div>
            </div>
          </div>

          <div className="card card-no-hpad">
            <table className="table" style={{ background: "transparent" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>ID</th>
                  <th style={{ textAlign: "left" }}>Client</th>
                  <th style={{ textAlign: "left" }}>Truck</th>
                  <th style={{ textAlign: "left" }}>Driver</th>
                  <th style={{ textAlign: "left" }}>Origin</th>
                  <th style={{ textAlign: "left" }}>Destination</th>
                  <th style={{ textAlign: "left" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} onClick={() => setSelected(o)} style={{ cursor: "pointer", background: selected?.id === o.id ? "#eef2f7" : undefined }}>
                    <td style={{ textAlign: "left" }}>{o.id}</td>
                    <td style={{ textAlign: "left" }}>
                      <div>{o.client}</div>
                      <div style={{ color: "#9ca3af", fontSize: 12 }}>#Reference</div>
                    </td>
                    <td style={{ textAlign: "left" }}>
                      <div>{o.truck}</div>
                      <div style={{ color: "#9ca3af", fontSize: 12 }}>Truck</div>
                    </td>
                    <td style={{ textAlign: "left" }}>
                      <div>{o.driver}</div>
                      <div style={{ color: "#9ca3af", fontSize: 12 }}>Phone</div>
                    </td>
                    <td style={{ textAlign: "left" }}>
                      <div>{o.origin}</div>
                      <div style={{ color: "#9ca3af", fontSize: 12 }}>Date</div>
                    </td>
                    <td style={{ textAlign: "left" }}>
                      <div>{o.destination}</div>
                      <div style={{ color: "#9ca3af", fontSize: 12 }}>Date</div>
                    </td>
                    <td style={{ textAlign: "left" }}><StatusPill status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="detail-panel">
          <div className="header">
            <div>
              <h3 style={{ margin: 0 }}>{selected?.id}</h3>
              <p style={{ marginTop: 6 }}>{selected?.client}</p>
            </div>
            <div>
              <StatusPill status={selected?.status} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>Plate</div>
              <div style={{ fontWeight: 600, marginTop: 6 }}>Truck</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-ghost">⤴</button>
              <button className="btn-ghost">✖</button>
            </div>
          </div>

          <div style={{ marginTop: 6, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 99, background: "#111827", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>D</div>
              <div>
                <div style={{ fontWeight: 600 }}>Driver</div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>Phone</div>
              </div>
            </div>
          </div>

          <h4 style={{ marginTop: 8, marginBottom: 8 }}>Stops</h4>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ color: "#6b7280", fontSize: 13 }}>20km</div>
            <StatusPill status={selected?.status} />
          </div>

          <div className="stop-left-border" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ color: "#10b981", fontWeight: 700 }}>Pick up</div>
                <div style={{ color: "#111827", fontWeight: 600 }}>Address Name</div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>Address</div>
              </div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>1</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
