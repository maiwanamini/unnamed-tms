"use client";

import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import Card from "@/components/Card";
import Filter from "@/components/Filter";
import SortByFilter from "@/components/SortByFilter";
import TrailersTable from "@/components/TrailersTable";

const PLACEHOLDER_DRIVERS = [
  { id: "D-01", name: "Driver" },
  { id: "D-02", name: "Driver" },
  { id: "D-03", name: "Driver" },
];

const PLACEHOLDER_TRUCKS = [
  { id: "TR-01", name: "Truck" },
  { id: "TR-02", name: "Truck" },
  { id: "TR-03", name: "Truck" },
];

const PLACEHOLDER_TRAILERS = Array.from({ length: 12 }).map((_, i) => {
  const n = i + 1;
  const dayNum = (n % 28) + 1;
  const monthNum = ((n + 3) % 12) + 1;
  const year = 2021;
  const createdAt = new Date(Date.UTC(year, monthNum - 1, dayNum)).toISOString();
  const status = n % 4 === 0 ? "Inactive" : "Active";
  const modelYear = 2018 + (n % 6);
  const EU_TYPES = [
    "Dry Van",
    "Reefer",
    "Flatbed",
    "Step Deck",
    "Tanker",
    "Lowboy",
    "Curtainside",
    "Hopper-Bottom",
  ];
  const type = EU_TYPES[n % EU_TYPES.length];

  return {
    id: `TL-${String(n).padStart(2, "0")}`,
    licensePlate: "1FHF222",
    trailer: "Trailer Name",
    status,
    type,
    modelYear,
    driverId: "",
    driverName: "",
    truckId: "",
    truckName: "",
    createdAt,
  };
});

function parseYearRange(value) {
  const v = String(value || "").trim();
  if (!v) return null;
  const parts = v.split("-").map((p) => p.trim());
  const a = Number(parts[0]);
  const b = Number(parts[1]);
  const from = Number.isFinite(a) ? a : null;
  const to = Number.isFinite(b) ? b : null;
  if (from == null && to == null) return null;
  return { from, to };
}

export default function Page() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [driver, setDriver] = useState("all");
  const [modelYear, setModelYear] = useState("");

  const [trailers, setTrailers] = useState(PLACEHOLDER_TRAILERS);

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "All" },
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
    ],
    []
  );

  const typeOptions = useMemo(
    () => [
      { value: "all", label: "All" },
      { value: "Dry Van", label: "Dry Van" },
      { value: "Reefer", label: "Reefer" },
      { value: "Flatbed", label: "Flatbed" },
      { value: "Step Deck", label: "Step Deck" },
      { value: "Tanker", label: "Tanker" },
      { value: "Lowboy", label: "Lowboy" },
      { value: "Curtainside", label: "Curtainside" },
      { value: "Hopper-Bottom", label: "Hopper-Bottom" },
    ],
    []
  );

  const driverOptions = useMemo(
    () => [{ value: "all", label: "All" }, ...PLACEHOLDER_DRIVERS.map((d) => ({ value: d.id, label: d.name }))],
    []
  );

  const visibleTrailers = useMemo(() => {
    const q = (query || "").toLowerCase().trim();
    const yr = parseYearRange(modelYear);

    return trailers.filter((t) => {
      if (q) {
        const hay = [t.licensePlate, t.trailer, t.driverName, t.truckName, t.type]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (status !== "all" && t.status !== status) return false;
      if (type !== "all" && t.type !== type) return false;
      if (driver !== "all" && (t.driverId || "") !== driver) return false;

      if (yr) {
        const v = Number(t.modelYear);
        if (Number.isFinite(yr.from) && v < yr.from) return false;
        if (Number.isFinite(yr.to) && v > yr.to) return false;
      }

      return true;
    });
  }, [trailers, query, status, type, driver, modelYear]);

  const assignDriver = (trailerId, driverId) => {
    const d = PLACEHOLDER_DRIVERS.find((x) => x.id === driverId);
    if (!d) return;
    setTrailers((prev) => prev.map((t) => (t.id === trailerId ? { ...t, driverId: d.id, driverName: d.name } : t)));
  };

  const assignTruck = (trailerId, truckId) => {
    const tr = PLACEHOLDER_TRUCKS.find((x) => x.id === truckId);
    if (!tr) return;
    setTrailers((prev) => prev.map((t) => (t.id === trailerId ? { ...t, truckId: tr.id, truckName: tr.name } : t)));
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header (non-scrolling) */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
          gap: 8,
          border: "none",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div className="page-header">
          <h2>Trailers</h2>
          <p>Manage your fleet trailers here.</p>
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
        >
          <AddIcon style={{ fontSize: 20 }} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>NEW</span>
        </button>
      </div>

      {/* Filters row */}
      <Card className="card header-card" style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
        <div className="w-full flex flex-wrap gap-x-2 gap-y-2">
          <div className="filters-row flex flex-wrap gap-2 w-full items-end" style={{ marginTop: 0, marginBottom: 0 }}>
            <Filter label={"Search"}>
              <div className="search-box" style={{ width: 242 }}>
                <SearchIcon className="search-icon" />
                <input className="search-input" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </Filter>

            <SortByFilter label="Status" value={status} onChange={setStatus} options={statusOptions} />
            <SortByFilter label="Type" value={type} onChange={setType} options={typeOptions} />
            <SortByFilter label="Drivers" value={driver} onChange={setDriver} options={driverOptions} />

            <Filter label={"Model Year"}>
              <input
                className="filter-input"
                placeholder="YYYY - YYYY"
                value={modelYear}
                onChange={(e) => setModelYear(e.target.value)}
              />
            </Filter>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="card card-no-hpad flex-1 min-h-0" style={{ padding: 0, display: "flex", flexDirection: "column" }}>
        <TrailersTable
          trailers={visibleTrailers}
          drivers={PLACEHOLDER_DRIVERS}
          trucks={PLACEHOLDER_TRUCKS}
          onAssignDriver={assignDriver}
          onAssignTruck={assignTruck}
        />
      </Card>
    </div>
  );
}
