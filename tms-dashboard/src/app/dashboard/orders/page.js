"use client";

import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import FiltersRow from "@/components/FiltersRow";
import Card from "@/components/Card";
import OrdersTable from "@/components/OrdersTable";
import DetailPanel from "@/components/DetailPanel";

function startOfDayUTC(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

const MOCK_ORDERS = [
  { id: "O-01", customer: "Customer name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Moving" },
  { id: "O-02", customer: "Customer name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Moving" },
  { id: "O-03", customer: "Customer name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Moving" },
  { id: "O-04", customer: "Customer name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Pending" },
  { id: "O-05", customer: "Customer name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Pending" },
  { id: "O-06", customer: "Customer name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Pending" },
  { id: "O-07", customer: "Customer name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Completed" },
  { id: "O-08", customer: "Customer name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Completed" },
  { id: "O-09", customer: "Customer name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Completed" },
  { id: "O-10", customer: "Customer name", truck: "Plate", driver: "Driver", origin: "Address Origin", destination: "Address Destination", status: "Canceled" },
];

// Expand mock orders so we can test scrolling
const ALL_ORDERS = Array.from({ length: 50 }).map((_, i) => {
  const base = MOCK_ORDERS[i % MOCK_ORDERS.length];
  const createdAt = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString();
  return { ...base, id: `O-${String(i + 1).padStart(2, "0")}`, createdAt };
});


export default function Page() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(ALL_ORDERS[1]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const filtered = useMemo(() => {
    const start = dateRange?.start ? startOfDayUTC(new Date(dateRange.start)) : null;
    const end = dateRange?.end ? startOfDayUTC(new Date(dateRange.end)) : null;

    return ALL_ORDERS.filter((o) => {
      // text search
      if (query) {
        const q = query.toLowerCase();
        const customer = (o.customer || "").toLowerCase();
        if (!(o.id.toLowerCase().includes(q) || customer.includes(q) || o.driver.toLowerCase().includes(q))) {
          return false;
        }
      }

      // status filter (empty = all)
      if (statusFilter && statusFilter.length > 0) {
        if (!statusFilter.includes(o.status)) return false;
      }

      // date filter (empty = all)
      if (start && end) {
        const t = startOfDayUTC(new Date(o.createdAt)).getTime();
        const a = Math.min(start.getTime(), end.getTime());
        const b = Math.max(start.getTime(), end.getTime());
        if (t < a || t > b) return false;
      }

      return true;
    });
  }, [dateRange, query, statusFilter]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header (non-scrolling) */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, gap: 8, border: 'none', borderBottom: '1px solid #e5e7eb' }}>
        <div className="page-header">
          <h2>Orders</h2>
          <p>Manage and dispatch orders</p>
        </div>
        <button className="btn-primary" style={{ width: 102, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 0, flexShrink: 0 }}>
          <AddIcon style={{ fontSize: 20 }} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>NEW</span>
        </button>
      </div>

      {/* Main content row: left (filters + table) and right (detail panel). Only these internal areas scroll. */}
      <div className="flex flex-1 min-h-0">
        {/* Left side: filters (fixed height) + table (scrolling) */}
        <div className="flex flex-col flex-1 min-h-0" style={{ minWidth: 0 }}>
          <Card className="card header-card" style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
            <div className="w-full flex flex-wrap gap-x-2 gap-y-2">
              <FiltersRow
                query={query}
                setQuery={setQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                dateRange={dateRange}
                setDateRange={setDateRange}
              />
            </div>
          </Card>
          <Card className="card card-no-hpad flex-1 min-h-0" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
            {/* OrdersTable internally scrolls its rows; footer stays visible at bottom of card */}
            <OrdersTable orders={filtered} selected={selected} setSelected={setSelected} />
          </Card>
        </div>

        {/* Right side: sticky detail panel; aside no border line */}
        <aside className="w-[360px] flex flex-col bg-white" style={{ flexShrink: 0, overflowX: 'hidden' }}>
          <DetailPanel selected={selected} />
        </aside>
      </div>
    </div>
  );
}
