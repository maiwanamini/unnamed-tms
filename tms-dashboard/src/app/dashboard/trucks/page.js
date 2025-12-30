"use client";

import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import Card from "@/components/Card";
import Filter from "@/components/Filter";
import FilterCheckboxSelect from "@/components/FilterCheckboxSelect";
import TrucksTable from "@/components/TrucksTable";
import TruckDetailPanel from "@/components/TruckDetailPanel";
import { useTrucks } from "@/hooks/useTrucks";
import { useTrailers } from "@/hooks/useTrailers";
import { useUsers } from "@/hooks/useUsers";
import { useOverlay } from "@/hooks/useOverlay";
import { apiFetch } from "@/lib/fetcher";
import { formatTrailerLabel } from "@/lib/vehicle";

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
  const { openOverlay } = useOverlay();
  const { trucks: trucksRaw, mutate: mutateTrucks } = useTrucks();
  const { trailers: trailersRaw, mutate: mutateTrailers } = useTrailers();
  const { users, mutate: mutateUsers } = useUsers();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState([]);
  const [type, setType] = useState([]);
  const [driver, setDriver] = useState([]);
  const [modelYear, setModelYear] = useState("");
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const drivers = useMemo(
    () => (Array.isArray(users) ? users : []).filter((u) => String(u?.role || "") === "driver"),
    [users]
  );

  const activeDriversForDropdown = useMemo(
    () => drivers.filter((d) => String(d?.status || "").trim().toLowerCase() !== "inactive"),
    [drivers]
  );

  const activeTrailersForDropdown = useMemo(() => {
    return (Array.isArray(trailersRaw) ? trailersRaw : [])
      .filter((tr) => String(tr?.status || "").trim().toLowerCase() !== "inactive")
      .map((tr) => ({ id: tr.id, name: formatTrailerLabel(tr) || tr.licensePlate || tr.id }));
  }, [trailersRaw]);

  const normalizeActiveInactive = (raw) => {
    const s = String(raw || "").trim().toLowerCase();
    if (s === "inactive") return "inactive";
    if (s === "active") return "active";
    return s ? "active" : "";
  };

  const trucks = useMemo(
    () =>
      (Array.isArray(trucksRaw) ? trucksRaw : []).map((t) => {
        const modelBits = [t?.year, t?.model].filter(Boolean).join(" ");
        return {
          id: t?.id,
          licensePlate: t?.licensePlate || "",
          truck: modelBits,
          status: normalizeActiveInactive(t?.status),
          type: t?.type || "",
          modelYear: t?.year ?? null,
          driverId: t?.driver?._id || t?.driver?.id || "",
          driverName: t?.driver?.fullName || t?.driver?.email || "",
          driverAvatarUrl: t?.driver?.avatarUrl || t?.driver?.profileImageUrl || t?.driver?.photoUrl || t?.driver?.imageUrl || "",
          trailerId: t?.trailer?._id || t?.trailer?.id || "",
          trailerName: formatTrailerLabel(t?.trailer) || t?.trailer?.licensePlate || "",
          createdAt: t?.createdAt,
        };
      }),
    [trucksRaw]
  );

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "All" },
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
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
        const hay = [t.licensePlate, t.truck, t.modelYear, t.driverName, t.trailerName, t.type]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (Array.isArray(status) && status.length > 0) {
        if (!status.map(String).includes(String(t.status || ""))) return false;
      }
      if (Array.isArray(type) && type.length > 0) {
        if (!type.map(String).includes(String(t.type || ""))) return false;
      }
      if (Array.isArray(driver) && driver.length > 0) {
        if (!driver.map(String).includes(String(t.driverId || ""))) return false;
      }

      if (yr) {
        const v = Number(t.modelYear);
        if (Number.isFinite(yr.from) && v < yr.from) return false;
        if (Number.isFinite(yr.to) && v > yr.to) return false;
      }

      return true;
    });
  }, [trucks, query, status, type, driver, modelYear]);

  // Close panel if the selected row is no longer visible.
  const selectedId = selected?.id;
  const resolvedSelected = useMemo(() => {
    if (!selectedId) return null;
    return visibleTrucks.find((t) => t.id === selectedId) || null;
  }, [selectedId, visibleTrucks]);

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

  const toggleStatus = (truckId, nextStatus) => {
    return apiFetch(`/trucks/${truckId}`, { method: "PUT", body: { status: nextStatus } })
      .then(() => mutateTrucks())
      .catch(() => null);
  };

  const handleEdit = () => {
    if (!resolvedSelected) return;
    const fullTruck = (Array.isArray(trucksRaw) ? trucksRaw : []).find((t) => t?.id === resolvedSelected.id) || resolvedSelected;
    openOverlay("truck", {
      mode: "edit",
      truck: fullTruck,
      drivers: activeDriversForDropdown.map((d) => ({ id: d.id, name: d.fullName || d.email || d.id })),
      trailers: activeTrailersForDropdown,
      afterSave: () => Promise.all([mutateTrucks(), mutateTrailers(), mutateUsers()]),
    });
  };

  const handleDelete = async () => {
    if (!resolvedSelected?.id) return;
    setDeleting(true);
    try {
      await apiFetch(`/trucks/${resolvedSelected.id}`, { method: "DELETE" });
      await Promise.all([mutateTrucks(), mutateTrailers(), mutateUsers()]);
      setSelected(null);
    } finally {
      setDeleting(false);
    }
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
          onClick={() =>
            openOverlay("truck", {
              drivers: activeDriversForDropdown.map((d) => ({ id: d.id, name: d.fullName || d.email || d.id })),
              trailers: activeTrailersForDropdown,
              afterSave: () => Promise.all([mutateTrucks(), mutateTrailers(), mutateUsers()]),
            })
          }
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

      {/* Main two-column grid: left table + right detail (when selected) */}
      <div
        className="dashboard-main"
        style={{
          display: "grid",
          gridTemplateColumns: resolvedSelected ? "minmax(0,2fr) minmax(320px,380px)" : "minmax(0,1fr)",
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
              <div className="filters-row flex flex-wrap gap-2 w-full items-end" style={{ marginTop: 0, marginBottom: 0 }}>
                <Filter label={"Search"}>
                  <div className="search-box" style={{ width: 242 }}>
                    <SearchIcon className="search-icon" />
                    <input className="search-input" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
                  </div>
                </Filter>

                <div style={{ width: 1, height: 40, backgroundColor: "#e5e7eb", alignSelf: "flex-end" }} />

                <FilterCheckboxSelect
                  label="Status"
                  value={Array.isArray(status) ? status : []}
                  onChange={setStatus}
                  placeholder="All"
                  options={statusOptions.filter((o) => o.value !== "all")}
                />
                <FilterCheckboxSelect
                  label="Type"
                  value={Array.isArray(type) ? type : []}
                  onChange={setType}
                  placeholder="All"
                  options={typeOptions.filter((o) => o.value !== "all")}
                />
                <FilterCheckboxSelect
                  label="Drivers"
                  value={Array.isArray(driver) ? driver : []}
                  onChange={setDriver}
                  placeholder="All"
                  options={driverOptions.filter((o) => o.value !== "all")}
                />

                <Filter label={"Model Year"}>
                  <input className="filter-input" placeholder="YYYY - YYYY" value={modelYear} onChange={(e) => setModelYear(e.target.value)} />
                </Filter>
              </div>
            </div>
          </Card>

          <Card className="card card-no-hpad flex-1 min-h-0" style={{ minWidth: 0, padding: 0, display: "flex", flexDirection: "column" }}>
            <TrucksTable
              trucks={visibleTrucks}
              drivers={activeDriversForDropdown.map((d) => ({ id: d.id, name: d.fullName || d.email || d.id, avatarUrl: d.avatarUrl }))}
              trailers={activeTrailersForDropdown}
              onAssignDriver={assignDriver}
              onAssignTrailer={assignTrailer}
              onToggleStatus={toggleStatus}
              selected={resolvedSelected}
              setSelected={setSelected}
            />
          </Card>
        </div>

        {/* Right column: detail panel */}
        {resolvedSelected ? (
          <aside className="w-full flex flex-col bg-white min-h-0" style={{ flexShrink: 0, height: "100%", overflow: "hidden" }}>
            <TruckDetailPanel
              selected={resolvedSelected}
              onClose={() => setSelected(null)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              deleting={deleting}
            />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
