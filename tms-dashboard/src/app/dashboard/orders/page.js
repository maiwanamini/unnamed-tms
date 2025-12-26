"use client";

import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import FiltersRow from "@/components/FiltersRow";
import Card from "@/components/Card";
import OrdersTable from "@/components/OrdersTable";
import DetailPanel from "@/components/DetailPanel";
import { useOrders } from "@/hooks/useOrders";
import { useOverlay } from "@/hooks/useOverlay";

function startOfDayUTC(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfDayLocal(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}


export default function Page() {
  const { orders: apiOrders } = useOrders();
  const { openOverlay } = useOverlay();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const mappedApiOrders = useMemo(() => {
    const mapStatus = (s) => {
      const v = String(s || "").toLowerCase();
      if (v === "completed") return "Completed";
      if (v === "cancelled" || v === "canceled") return "Canceled";
      if (v === "in-progress" || v === "inprogress") return "Moving";
      if (v === "assigned") return "Pending";
      if (v === "pending") return "Pending";
      return s || "Pending";
    };

    const toStop = (stop) => {
      const planned = stop?.plannedTime ? new Date(stop.plannedTime) : null;
      return {
        id: stop?._id || stop?.id,
        type: stop?.type === "pickup" ? "pickup" : "dropoff",
        title: stop?.locationName || "",
        address: stop?.address || "",
        ref: stop?.reference ? String(stop.reference) : "",
        time: planned ? planned.toLocaleString() : "",
        note: stop?.note || "",
        status: stop?.completed ? "Completed" : "Pending",
        orderIndex: stop?.orderIndex,
      };
    };

    const toOrder = (o) => {
      const orderNumber = o?.orderNumber || o?._id;
      const stops = Array.isArray(o?.stops) ? [...o.stops] : [];
      stops.sort((a, b) => (Number(a?.orderIndex) || 0) - (Number(b?.orderIndex) || 0));

      const safeDate = (v) => {
        if (!v) return null;
        const d = new Date(v);
        return Number.isNaN(d.getTime()) ? null : d;
      };

      const firstStopPlanned = safeDate(stops[0]?.plannedTime);
      const lastStopPlanned = safeDate(stops.length ? stops[stops.length - 1]?.plannedTime : null);
      const earliestPlanned = stops.reduce((min, s) => {
        const d = safeDate(s?.plannedTime);
        if (!d) return min;
        if (!min) return d;
        return d.getTime() < min.getTime() ? d : min;
      }, null);

      const tableDate = earliestPlanned || safeDate(o?.date) || safeDate(o?.createdAt);

      const firstStopAddr = stops[0]?.address;
      const lastStopAddr = stops.length ? stops[stops.length - 1]?.address : "";

      return {
        id: orderNumber,
        customer: o?.customerName || "",
        reference: o?.reference || "",
        truck: o?.truck?.licensePlate || "",
        driver: o?.driver?.fullName || "",
        driverPhone: o?.driver?.phone || "",
        driverAvatarUrl:
          o?.driver?.avatarUrl || o?.driver?.profileImageUrl || o?.driver?.photoUrl || o?.driver?.imageUrl || "",
        origin: firstStopAddr || o?.customerAddress || "",
        destination: lastStopAddr || o?.customerAddress || "",
        originDate: firstStopPlanned ? firstStopPlanned.toLocaleDateString() : "",
        destinationDate: lastStopPlanned ? lastStopPlanned.toLocaleDateString() : "",
        status: mapStatus(o?.status),
        createdAt: o?.createdAt || o?.date,
        tableDate: tableDate ? tableDate.toISOString() : (o?.createdAt || o?.date),
        stops: stops.map((s) => toStop(s)),
      };
    };

    return (Array.isArray(apiOrders) ? apiOrders : []).map(toOrder);
  }, [apiOrders]);

  // Keep selection if possible; otherwise clear selection (no auto-select).
  const selectedId = selected?.id;
  const resolvedSelected = useMemo(() => {
    if (!selectedId) return null;
    return mappedApiOrders.find((o) => o.id === selectedId) || null;
  }, [selectedId, mappedApiOrders]);

  const filtered = useMemo(() => {
    const start = dateRange?.start ? startOfDayLocal(new Date(dateRange.start)) : null;
    const end = dateRange?.end ? startOfDayLocal(new Date(dateRange.end)) : null;

    return mappedApiOrders.filter((o) => {
      // text search
      if (query) {
        const q = query.toLowerCase();
        const customer = (o.customer || "").toLowerCase();
        const driver = String(o.driver || "").toLowerCase();
        if (!(String(o.id || "").toLowerCase().includes(q) || customer.includes(q) || driver.includes(q))) {
          return false;
        }
      }

      // status filter (empty = all)
      if (statusFilter && statusFilter.length > 0) {
        if (!statusFilter.includes(o.status)) return false;
      }

      // date filter (empty = all)
      if (start && end) {
        const t = startOfDayLocal(new Date(o.tableDate || o.createdAt)).getTime();
        const a = Math.min(start.getTime(), end.getTime());
        const b = Math.max(start.getTime(), end.getTime());
        if (t < a || t > b) return false;
      }

      return true;
    });
  }, [dateRange, query, mappedApiOrders, statusFilter]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header (non-scrolling) */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 0,
          padding: 16,
          gap: 8,
          border: "none",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div className="page-header">
          <h2>Orders</h2>
          <p>Manage and dispatch orders</p>
        </div>
        <button
          className="btn-primary"
          style={{
            width: 102,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: 0,
            flexShrink: 0,
          }}
          onClick={() => openOverlay("order")}
        >
          <AddIcon style={{ fontSize: 20 }} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>NEW</span>
        </button>
      </div>

      {/* Main two-column grid: left table (flexible) + right detail (fixed range) */}
      <div
        className="dashboard-main"
        style={{
          display: "grid",
          gridTemplateColumns: resolvedSelected
            ? "minmax(0,2fr) minmax(320px,380px)"
            : "minmax(0,1fr)",
          gap: 0,
          flex: "1 1 0%",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* Left column: filters + table */}
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
          <Card className="card header-card" style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
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

          <Card
            className="card card-no-hpad flex-1 min-h-0"
            style={{ minWidth: 0, padding: 0, display: "flex", flexDirection: "column" }}
          >
            <OrdersTable orders={filtered} selected={resolvedSelected} setSelected={setSelected} />
          </Card>
        </div>

        {/* Right column: detail panel */}
        {resolvedSelected ? (
          <aside
            className="w-full flex flex-col bg-white min-h-0"
            style={{ flexShrink: 0, height: "100%", overflow: "hidden" }}
          >
            <DetailPanel selected={resolvedSelected} />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
