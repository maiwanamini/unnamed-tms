"use client";

import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import Card from "@/components/Card";
import Filter from "@/components/Filter";
import SortByFilter from "@/components/SortByFilter";
import TrailersTable from "@/components/TrailersTable";
import { useTrailers } from "@/hooks/useTrailers";
import { useTrucks } from "@/hooks/useTrucks";
import { useUsers } from "@/hooks/useUsers";
import { apiFetch } from "@/lib/fetcher";

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
  const { trailers: trailersRaw, mutate: mutateTrailers } = useTrailers();
  const { trucks: trucksRaw, mutate: mutateTrucks } = useTrucks();
  const { users, mutate: mutateUsers } = useUsers();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [driver, setDriver] = useState("all");
  const [modelYear, setModelYear] = useState("");

  const drivers = useMemo(
    () => (Array.isArray(users) ? users : []).filter((u) => String(u?.role || "") === "driver"),
    [users]
  );

  const trucks = useMemo(
    () => (Array.isArray(trucksRaw) ? trucksRaw : []).map((t) => ({ id: t.id, name: t.licensePlate || t.id })),
    [trucksRaw]
  );

  const trailers = useMemo(
    () =>
      (Array.isArray(trailersRaw) ? trailersRaw : []).map((t) => {
        const modelBits = [t?.year, t?.brand, t?.model].filter(Boolean).join(" ");
        const truckId = t?.truck?._id || t?.truck?.id || "";
        const truckName = t?.truck?.licensePlate || "";
        const driverId = t?.truck?.driver?._id || t?.truck?.driver?.id || "";
        const driverName = t?.truck?.driver?.fullName || t?.truck?.driver?.email || "";

        return {
          id: t?.id,
          licensePlate: t?.licensePlate || "",
          trailer: modelBits,
          status: t?.status || "",
          type: t?.type || "",
          modelYear: t?.year ?? null,
          driverId,
          driverName,
          truckId,
          truckName,
          createdAt: t?.createdAt,
        };
      }),
    [trailersRaw]
  );

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
    () => [{ value: "all", label: "All" }, ...drivers.map((d) => ({ value: d.id, label: d.fullName || d.email || d.id }))],
    [drivers]
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

  const assignTruck = (trailerId, truckId) => {
    return apiFetch(`/trailers/${trailerId}`, { method: "PUT", body: { truck: truckId || null } })
      .then(() => Promise.all([mutateTrailers(), mutateTrucks()]))
      .catch(() => null);
  };

  const assignDriver = (trailerId, driverId) => {
    const trailer = trailers.find((t) => t.id === trailerId);
    const truckId = trailer?.truckId;
    if (!truckId) return Promise.resolve();

    return apiFetch(`/trucks/${truckId}`, { method: "PUT", body: { driver: driverId || null } })
      .then(() => Promise.all([mutateUsers(), mutateTrucks(), mutateTrailers()]))
      .catch(() => null);
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
          drivers={drivers.map((d) => ({ id: d.id, name: d.fullName || d.email || d.id }))}
          trucks={trucks}
          onAssignDriver={assignDriver}
          onAssignTruck={assignTruck}
        />
      </Card>
    </div>
  );
}
