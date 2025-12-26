"use client";

import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import Card from "@/components/Card";
import Filter from "@/components/Filter";
import SortByFilter from "@/components/SortByFilter";
import TrucksTable from "@/components/TrucksTable";
import { useTrucks } from "@/hooks/useTrucks";
import { useTrailers } from "@/hooks/useTrailers";
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
  const { trucks: trucksRaw, mutate: mutateTrucks } = useTrucks();
  const { trailers: trailersRaw, mutate: mutateTrailers } = useTrailers();
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
    () =>
      (Array.isArray(trucksRaw) ? trucksRaw : []).map((t) => {
        const modelBits = [t?.year, t?.brand, t?.model].filter(Boolean).join(" ");
        return {
          id: t?.id,
          licensePlate: t?.licensePlate || "",
          truck: modelBits,
          status: t?.status || "",
          type: t?.type || "",
          modelYear: t?.year ?? null,
          driverId: t?.driver?._id || t?.driver?.id || "",
          driverName: t?.driver?.fullName || t?.driver?.email || "",
          trailerId: t?.trailer?._id || t?.trailer?.id || "",
          trailerName: t?.trailer?.licensePlate || "",
          createdAt: t?.createdAt,
        };
      }),
    [trucksRaw]
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
      { value: "Tractor unit", label: "Tractor unit" },
      { value: "Rigid / box truck", label: "Rigid / box truck" },
      { value: "Refrigerated (reefer) truck", label: "Refrigerated (reefer) truck" },
      { value: "Flatbed truck", label: "Flatbed truck" },
      { value: "Tanker truck", label: "Tanker truck" },
      { value: "Tip truck / dumper", label: "Tip truck / dumper" },
      { value: "Van (light commercial)", label: "Van (light commercial)" },
    ],
    []
  );

  const driverOptions = useMemo(
    () => [{ value: "all", label: "All" }, ...drivers.map((d) => ({ value: d.id, label: d.fullName || d.email || d.id }))],
    [drivers]
  );

  const visibleTrucks = useMemo(() => {
    const q = (query || "").toLowerCase().trim();
    const yr = parseYearRange(modelYear);

    return trucks.filter((t) => {
      if (q) {
        const hay = [t.licensePlate, t.truck, t.driverName, t.trailerName, t.type]
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
  }, [trucks, query, status, type, driver, modelYear]);

  const assignDriver = (truckId, driverId) => {
    return apiFetch(`/trucks/${truckId}`, { method: "PUT", body: { driver: driverId || null } })
      .then(() => Promise.all([mutateTrucks(), mutateUsers()]))
      .catch(() => null);
  };

  const assignTrailer = (truckId, trailerId) => {
    return apiFetch(`/trucks/${truckId}`, { method: "PUT", body: { trailer: trailerId || null } })
      .then(() => Promise.all([mutateTrucks(), mutateTrailers()]))
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
          <h2>Trucks</h2>
          <p>Manage your fleet trucks here.</p>
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
        <TrucksTable
          trucks={visibleTrucks}
          drivers={drivers.map((d) => ({ id: d.id, name: d.fullName || d.email || d.id }))}
          trailers={(Array.isArray(trailersRaw) ? trailersRaw : []).map((tr) => ({ id: tr.id, name: tr.licensePlate || tr.id }))}
          onAssignDriver={assignDriver}
          onAssignTrailer={assignTrailer}
        />
      </Card>
    </div>
  );
}
