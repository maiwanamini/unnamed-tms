"use client";

import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import Card from "@/components/Card";
import Filter from "@/components/Filter";
import FilterCheckboxSelect from "@/components/FilterCheckboxSelect";
import TrailersTable from "@/components/TrailersTable";
import TrailerDetailPanel from "@/components/TrailerDetailPanel";
import { useTrailers } from "@/hooks/useTrailers";
import { useTrucks } from "@/hooks/useTrucks";
import { useUsers } from "@/hooks/useUsers";
import { useOverlay } from "@/hooks/useOverlay";
import { apiFetch } from "@/lib/fetcher";
import { formatTruckLabel } from "@/lib/vehicle";

export default function Page() {
  const { openOverlay } = useOverlay();
  const { trailers: trailersRaw, mutate: mutateTrailers } = useTrailers();
  const { trucks: trucksRaw, mutate: mutateTrucks } = useTrucks();
  const { users, mutate: mutateUsers } = useUsers();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState([]);
  const [type, setType] = useState([]);
  const [driver, setDriver] = useState([]);
  const [trailerNumber, setTrailerNumber] = useState("");
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

  const normalizeTrailerActiveInactive = (raw) => {
    const s = String(raw || "").trim().toLowerCase();
    // Backend trailer status is typically: available | in-use | maintenance.
    // Map to UI's Active/Inactive convention.
    if (s === "maintenance" || s === "inactive") return "inactive";
    if (s === "available" || s === "in-use" || s === "active") return "active";
    return s ? "active" : "";
  };

  const normalizeTruckActiveInactive = (raw) => {
    const s = String(raw || "").trim().toLowerCase();
    if (s === "inactive") return "inactive";
    if (s === "active") return "active";
    return s ? "active" : "";
  };

  const trucks = useMemo(
    () =>
      (Array.isArray(trucksRaw) ? trucksRaw : [])
        .filter((t) => normalizeTruckActiveInactive(t?.status) !== "inactive")
        .map((t) => ({ id: t.id, name: formatTruckLabel(t) || t.licensePlate || t.id })),
    [trucksRaw]
  );

  const trailers = useMemo(
    () =>
      (Array.isArray(trailersRaw) ? trailersRaw : []).map((t) => {
        const modelBits = [t?.trailerNumber, t?.brand, t?.model].filter(Boolean).join(" ");
        const truckId = t?.truck?._id || t?.truck?.id || "";
        const truckName = formatTruckLabel(t?.truck) || t?.truck?.licensePlate || "";
        const driverId = t?.truck?.driver?._id || t?.truck?.driver?.id || "";
        const driverName = t?.truck?.driver?.fullName || t?.truck?.driver?.email || "";
        const driverAvatarUrl =
          t?.truck?.driver?.avatarUrl ||
          t?.truck?.driver?.profileImageUrl ||
          t?.truck?.driver?.photoUrl ||
          t?.truck?.driver?.imageUrl ||
          "";

        return {
          id: t?.id,
          licensePlate: t?.licensePlate || "",
          trailer: modelBits,
          trailerNumber: t?.trailerNumber || "",
          status: normalizeTrailerActiveInactive(t?.status),
          type: t?.type || "",
          driverId,
          driverName,
          driverAvatarUrl,
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
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
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
    const tn = (trailerNumber || "").toLowerCase().trim();

    return trailers.filter((t) => {
      if (q) {
        const hay = [t.licensePlate, t.trailer, t.driverName, t.truckName, t.type]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (tn) {
        const v = String(t.trailerNumber || "").toLowerCase();
        if (!v.includes(tn)) return false;
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

      return true;
    });
  }, [trailers, query, status, type, driver, trailerNumber]);

  // Close panel if the selected row is no longer visible.
  const selectedId = selected?.id;
  const resolvedSelected = useMemo(() => {
    if (!selectedId) return null;
    return visibleTrailers.find((t) => t.id === selectedId) || null;
  }, [selectedId, visibleTrailers]);

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

  const toggleStatus = (trailerId, nextStatus) => {
    return apiFetch(`/trailers/${trailerId}`, { method: "PUT", body: { status: nextStatus } })
      .then(() => mutateTrailers())
      .catch(() => null);
  };

  const handleEdit = () => {
    if (!resolvedSelected) return;
    const fullTrailer = (Array.isArray(trailersRaw) ? trailersRaw : []).find((t) => t?.id === resolvedSelected.id) || resolvedSelected;
    openOverlay("trailer", {
      mode: "edit",
      trailer: fullTrailer,
      trucks,
      afterSave: () => Promise.all([mutateTrailers(), mutateTrucks(), mutateUsers()]),
    });
  };

  const handleDelete = async () => {
    if (!resolvedSelected?.id) return;
    setDeleting(true);
    try {
      await apiFetch(`/trailers/${resolvedSelected.id}`, { method: "DELETE" });
      await Promise.all([mutateTrailers(), mutateTrucks(), mutateUsers()]);
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
          <h2>Trailers</h2>
          <p>Manage your fleet trailers here.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() =>
            openOverlay("trailer", {
              trucks,
              afterSave: () => Promise.all([mutateTrailers(), mutateTrucks(), mutateUsers()]),
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

                <Filter label={"Trailer Number"}>
                  <input className="filter-input" placeholder="Trailer #" value={trailerNumber} onChange={(e) => setTrailerNumber(e.target.value)} />
                </Filter>
              </div>
            </div>
          </Card>

          <Card className="card card-no-hpad flex-1 min-h-0" style={{ minWidth: 0, padding: 0, display: "flex", flexDirection: "column" }}>
            <TrailersTable
              trailers={visibleTrailers}
              drivers={activeDriversForDropdown.map((d) => ({ id: d.id, name: d.fullName || d.email || d.id, avatarUrl: d.avatarUrl }))}
              trucks={trucks}
              onAssignDriver={assignDriver}
              onAssignTruck={assignTruck}
              onToggleStatus={toggleStatus}
              selected={resolvedSelected}
              setSelected={setSelected}
            />
          </Card>
        </div>

        {/* Right column: detail panel */}
        {resolvedSelected ? (
          <aside className="w-full flex flex-col bg-white min-h-0" style={{ flexShrink: 0, height: "100%", overflow: "hidden" }}>
            <TrailerDetailPanel
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
