"use client";

import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FiltersRow from "@/components/FiltersRow";
import Card from "@/components/Card";
import OrdersTable from "@/components/OrdersTable";
import DetailPanel from "@/components/DetailPanel";

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

// Expand mock orders so we can test scrolling
const ALL_ORDERS = Array.from({ length: 50 }).map((_, i) => {
  const base = MOCK_ORDERS[i % MOCK_ORDERS.length];
  return { ...base, id: `O-${String(i + 1).padStart(2, "0")}` };
});


export default function Page() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(ALL_ORDERS[1]);
  const [statusFilter, setStatusFilter] = useState([]);

  const filtered = ALL_ORDERS.filter((o) => {
    // text search
    if (query) {
      const q = query.toLowerCase();
      if (
        !(
          o.id.toLowerCase().includes(q) ||
          o.client.toLowerCase().includes(q) ||
          o.driver.toLowerCase().includes(q)
        )
      ) {
        return false;
      }
    }

    // status filter (empty = all)
    if (statusFilter && statusFilter.length > 0) {
      if (!statusFilter.includes(o.status)) return false;
    }

    return true;
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
          <Card className="card header-card" style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
            <FiltersRow query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
          </Card>

          <Card className="card card-no-hpad">
            <OrdersTable orders={filtered} selected={selected} setSelected={setSelected} />
          </Card>
        </div>

        <DetailPanel selected={selected} />
      </div>
    </div>
  );
}
