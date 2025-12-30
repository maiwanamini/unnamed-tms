"use client";

import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import FiltersRow from "@/components/FiltersRow";
import Card from "@/components/Card";
import OrdersTable from "@/components/OrdersTable";
import DetailPanel from "@/components/DetailPanel";
import { useOrders } from "@/hooks/useOrders";
import { useTrucks } from "@/hooks/useTrucks";
import { useTrailers } from "@/hooks/useTrailers";
import { useUsers } from "@/hooks/useUsers";
import { useOverlay } from "@/hooks/useOverlay";
import { formatDateDDMMYYYY } from "@/lib/date";
import { prettyTruckType, formatTruckLabel, formatTrailerLabel } from "@/lib/vehicle";
import { apiFetch } from "@/lib/fetcher";

function startOfDayLocal(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}


export default function Page() {
  const { orders: apiOrders, mutate: mutateOrders } = useOrders();
  const { trucks: allTrucks } = useTrucks();
  const { trailers: allTrailers } = useTrailers();
  const { users } = useUsers();
  const { openOverlay } = useOverlay();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [customer, setCustomer] = useState([]);
  const [truck, setTruck] = useState([]);

  const userAvatarById = useMemo(() => {
    const out = {};
    for (const u of Array.isArray(users) ? users : []) {
      const id = String(u?.id || u?._id || "");
      if (!id) continue;
      const url = String(u?.avatarUrl || "");
      if (url) out[id] = url;
    }
    return out;
  }, [users]);

  const driversForAssign = useMemo(() => {
    return (Array.isArray(users) ? users : [])
      .filter((u) => String(u?.role || "") === "driver")
      .map((u) => ({
        id: String(u?.id || u?._id || ""),
        name: String(u?.fullName || u?.email || u?.id || u?._id || ""),
        avatarUrl: String(u?.avatarUrl || ""),
      }))
      .filter((d) => d.id && d.name);
  }, [users]);

  const trucksForAssign = useMemo(() => {
    return (Array.isArray(allTrucks) ? allTrucks : [])
      .map((t) => ({
        id: String(t?.id || t?._id || ""),
        name: formatTruckLabel(t) || String(t?.licensePlate || t?.id || t?._id || ""),
      }))
      .filter((t) => t.id && t.name);
  }, [allTrucks]);

  const trailersForAssign = useMemo(() => {
    return (Array.isArray(allTrailers) ? allTrailers : [])
      .map((t) => ({
        id: String(t?.id || t?._id || ""),
        name: formatTrailerLabel(t) || String(t?.licensePlate || t?.id || t?._id || ""),
      }))
      .filter((t) => t.id && t.name);
  }, [allTrailers]);

  const assignOrderField = (orderDbId, patch) => {
    const id = String(orderDbId || "");
    if (!id) return Promise.resolve();
    return apiFetch(`/orders/${id}`, { method: "PUT", body: patch })
      .then(() => mutateOrders())
      .catch(() => null);
  };

  const assignOrderTruck = (orderDbId, truckId) => assignOrderField(orderDbId, { truck: truckId || null });
  const assignOrderTrailer = (orderDbId, trailerId) => assignOrderField(orderDbId, { trailer: trailerId || null });
  const assignOrderDriver = (orderDbId, driverId) => assignOrderField(orderDbId, { driver: driverId || null });

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
      const lat = typeof stop?.geo?.lat === "number" ? stop.geo.lat : null;
      const lng = typeof stop?.geo?.lng === "number" ? stop.geo.lng : null;
      return {
        id: stop?._id || stop?.id,
        type: stop?.type === "pickup" ? "pickup" : "dropoff",
        title: stop?.locationName || "",
        address: stop?.address || "",
        city: stop?.city || "",
        region: stop?.region || "",
        ref: stop?.reference ? String(stop.reference) : "",
        time: planned ? planned.toLocaleString() : "",
        note: stop?.note || "",
        status: stop?.completed ? "Completed" : "Pending",
        orderIndex: stop?.orderIndex,
        geo: { lat, lng },
      };
    };

    const stripPostalPrefix = (s) => {
      const v = String(s || "").trim();
      // Common format: "2830 Willebroek" -> "Willebroek"
      return v.replace(/^\s*\d{3,6}\s+/, "").trim();
    };

    const shortPlaceFromStopOrAddress = (stop) => {
      const raw = String(stop?.address || "");

      const parseFromAddress = () => {
        const parts = raw
          .split(",")
          .map((x) => String(x || "").trim())
          .filter(Boolean);

        if (parts.length >= 3) {
          const town = stripPostalPrefix(parts[1]);
          const region = parts[2];
          return { town, region };
        }

        if (parts.length === 2) {
          const town = stripPostalPrefix(parts[1]);
          return { town, region: "" };
        }

        return { town: "", region: "" };
      };

      const city = stripPostalPrefix(stop?.city) || "";
      let region = String(stop?.region || "").trim();

      // If we have a city but no region (common for older stops), derive region from address.
      if (city && !region) {
        const parsed = parseFromAddress();
        if (parsed.region) region = parsed.region;
      }

      if (city && region) return `${city}, ${region}`.trim();
      if (city) return city;

      // No city stored: fall back to parsing town/region from full address.
      const parsed = parseFromAddress();
      if (parsed.town && parsed.region) return `${parsed.town}, ${parsed.region}`.trim();
      if (parsed.town) return parsed.town;
      if (parsed.region) return parsed.region;

      return raw;
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

      const originShort = stops[0] ? shortPlaceFromStopOrAddress(toStop(stops[0])) : "";
      const destinationShort = stops.length ? shortPlaceFromStopOrAddress(toStop(stops[stops.length - 1])) : "";

      const driverId = o?.driver?._id || o?.driver?.id || "";
      const driverAvatarUrl =
        o?.driver?.avatarUrl ||
        o?.driver?.profileImageUrl ||
        o?.driver?.photoUrl ||
        o?.driver?.imageUrl ||
        userAvatarById[String(driverId || "")] ||
        "";

      return {
        id: orderNumber,
        dbId: o?._id || "",
        customer: o?.customerName || "",
        reference: o?.reference || "",
        truck: String(o?.truck?.licensePlate || "").trim(),
        truckType: String(o?.truck?.type || "").trim(),
        truckId: o?.truck?._id || "",
        trailer: String(o?.trailer?.licensePlate || "").trim(),
        trailerNumber: String(o?.trailer?.trailerNumber || "").trim(),
        trailerType: String(o?.trailer?.type || "").trim(),
        trailerId: o?.trailer?._id || "",
        driver: o?.driver?.fullName || "",
        driverId,
        driverPhone: o?.driver?.phone || "",
        driverAvatarUrl: String(driverAvatarUrl || ""),
        origin: originShort || firstStopAddr || o?.customerAddress || "",
        destination: destinationShort || lastStopAddr || o?.customerAddress || "",
        originDate: firstStopPlanned ? formatDateDDMMYYYY(firstStopPlanned, { utc: false }) : "",
        destinationDate: lastStopPlanned ? formatDateDDMMYYYY(lastStopPlanned, { utc: false }) : "",
        status: mapStatus(o?.status),
        createdAt: o?.createdAt || o?.date,
        tableDate: tableDate ? tableDate.toISOString() : (o?.createdAt || o?.date),
        stops: stops.map((s) => toStop(s)),
      };
    };

    return (Array.isArray(apiOrders) ? apiOrders : []).map(toOrder);
  }, [apiOrders, userAvatarById]);

  const customerOptions = useMemo(() => {
    const set = new Set();
    for (const o of mappedApiOrders) {
      const name = String(o?.customer || "").trim();
      if (name) set.add(name);
    }
    const list = Array.from(set).sort((a, b) => a.localeCompare(b));
    return [{ value: "all", label: "All" }, ...list.map((x) => ({ value: x, label: x }))];
  }, [mappedApiOrders]);

  const truckOptions = useMemo(() => {
    const set = new Set();

    const typeByPlate = new Map();
    for (const t of Array.isArray(allTrucks) ? allTrucks : []) {
      const plate = String(t?.licensePlate || "").trim();
      if (!plate) continue;
      const typeLabel = prettyTruckType(t?.type);
      if (typeLabel) typeByPlate.set(plate, typeLabel);
    }

    // Prefer the authoritative trucks list so the dropdown shows all trucks,
    // even if they don't appear in the currently loaded orders.
    for (const t of Array.isArray(allTrucks) ? allTrucks : []) {
      const plate = String(t?.licensePlate || "").trim();
      if (plate) set.add(plate);
    }

    // Also include any plates referenced by orders (in case of legacy/deleted trucks).
    for (const o of mappedApiOrders) {
      const plate = String(o?.truck || "").trim();
      if (plate) set.add(plate);
    }

    const list = Array.from(set).sort((a, b) => a.localeCompare(b));
    return [
      { value: "all", label: "All" },
      ...list.map((plate) => {
        const typeLabel = typeByPlate.get(plate) || "";
        return { value: plate, label: typeLabel ? `${plate} - ${typeLabel}` : plate };
      }),
    ];
  }, [allTrucks, mappedApiOrders]);

  // Keep selection if possible; otherwise clear selection (no auto-select).
  const selectedId = selected?.id;
  const resolvedSelected = useMemo(() => {
    if (!selectedId) return null;
    return mappedApiOrders.find((o) => o.id === selectedId) || null;
  }, [selectedId, mappedApiOrders]);

  const { filtered, customerCounts, truckCounts, statusCounts } = useMemo(() => {
    const start = dateRange?.start ? startOfDayLocal(new Date(dateRange.start)) : null;
    const end = dateRange?.end ? startOfDayLocal(new Date(dateRange.end)) : null;

    const selectedCustomers = Array.isArray(customer) ? customer.map(String) : [];
    const selectedTrucks = Array.isArray(truck) ? truck.map(String) : [];
    const selectedStatuses = Array.isArray(statusFilter) ? statusFilter : [];

    const matches = (o, { ignoreCustomer = false, ignoreTruck = false, ignoreStatus = false } = {}) => {
      // text search
      if (query) {
        const q = String(query || "").toLowerCase();
        const customerName = String(o.customer || "").toLowerCase();
        const driverName = String(o.driver || "").toLowerCase();
        if (!(String(o.id || "").toLowerCase().includes(q) || customerName.includes(q) || driverName.includes(q))) {
          return false;
        }
      }

      // status filter (empty = all)
      if (!ignoreStatus && selectedStatuses.length > 0) {
        if (!selectedStatuses.includes(o.status)) return false;
      }

      // customer filter
      if (!ignoreCustomer && selectedCustomers.length > 0) {
        const v = String(o.customer || "");
        if (!selectedCustomers.includes(v)) return false;
      }

      // truck filter
      if (!ignoreTruck && selectedTrucks.length > 0) {
        const v = String(o.truck || "");
        if (!selectedTrucks.includes(v)) return false;
      }

      // date filter (empty = all)
      if (start && end) {
        const t = startOfDayLocal(new Date(o.tableDate || o.createdAt)).getTime();
        const a = Math.min(start.getTime(), end.getTime());
        const b = Math.max(start.getTime(), end.getTime());
        if (t < a || t > b) return false;
      }

      return true;
    };

    const countBy = (list, getKey) => {
      const out = {};
      for (const item of Array.isArray(list) ? list : []) {
        const key = String(getKey(item) || "").trim();
        if (!key) continue;
        out[key] = (out[key] || 0) + 1;
      }
      return out;
    };

    const filtered = mappedApiOrders.filter((o) => matches(o));

    // Faceted counts: count options based on the table after applying all OTHER filters.
    const customerCounts = countBy(
      mappedApiOrders.filter((o) => matches(o, { ignoreCustomer: true })),
      (o) => o.customer,
    );

    const truckCounts = countBy(
      mappedApiOrders.filter((o) => matches(o, { ignoreTruck: true })),
      (o) => o.truck,
    );

    const statusCounts = countBy(
      mappedApiOrders.filter((o) => matches(o, { ignoreStatus: true })),
      (o) => o.status,
    );

    return { filtered, customerCounts, truckCounts, statusCounts };
  }, [dateRange, query, mappedApiOrders, statusFilter, customer, truck]);

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
                statusCounts={statusCounts}
                dateRange={dateRange}
                setDateRange={setDateRange}
                customer={customer}
                setCustomer={setCustomer}
                customerOptions={customerOptions}
                customerCounts={customerCounts}
                truck={truck}
                setTruck={setTruck}
                truckOptions={truckOptions}
                truckCounts={truckCounts}
              >
              </FiltersRow>
            </div>
          </Card>

          <Card
            className="card card-no-hpad flex-1 min-h-0"
            style={{ minWidth: 0, padding: 0, display: "flex", flexDirection: "column" }}
          >
            <OrdersTable
              orders={filtered}
              selected={resolvedSelected}
              setSelected={setSelected}
              drivers={driversForAssign}
              trucks={trucksForAssign}
              trailers={trailersForAssign}
              onAssignDriver={assignOrderDriver}
              onAssignTruck={assignOrderTruck}
              onAssignTrailer={assignOrderTrailer}
            />
          </Card>
        </div>

        {/* Right column: detail panel */}
        {resolvedSelected ? (
          <aside
            className="w-full flex flex-col bg-white min-h-0"
            style={{ flexShrink: 0, height: "100%", overflow: "hidden" }}
          >
            <DetailPanel selected={resolvedSelected} onClose={() => setSelected(null)} />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
