"use client";

import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import Card from "@/components/Card";
import Filter from "@/components/Filter";
import SortByFilter from "@/components/SortByFilter";
import DriversTable from "@/components/DriversTable";
import { useOverlay } from "@/hooks/useOverlay";
import { useUsers } from "@/hooks/useUsers";
import { useTrucks } from "@/hooks/useTrucks";
import { apiFetch } from "@/lib/fetcher";

// Drivers are real backend users; creation via overlay is not yet backend-backed.

function isInAgeGroup(age, group) {
  const a = Number(age);
  if (!Number.isFinite(a)) return false;

  if (group === "18-25") return a >= 18 && a <= 25;
  if (group === "26-35") return a >= 26 && a <= 35;
  if (group === "36-45") return a >= 36 && a <= 45;
  if (group === "46+") return a >= 46;
  return true;
}

export default function Page() {
  const { openOverlay } = useOverlay();
  const { users, mutate: mutateUsers } = useUsers();
  const { trucks, mutate: mutateTrucks } = useTrucks();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [age, setAge] = useState("all");
  const [truck, setTruck] = useState("all");

  const drivers = useMemo(() => {
    return (Array.isArray(users) ? users : [])
      .filter((u) => String(u?.role || "") === "driver")
      .map((u) => ({
      id: u.id,
      fullName: u.fullName || u.email || "",
      status: "Active",
      phone: u.phone || "",
      email: u.email || "",
      age: 31,
      truckId: u.truck?._id || "",
      truckName: u.truck?.licensePlate || "",
      createdAt: u.createdAt,
      avatarUrl: u.avatarUrl || "",
    }));
  }, [users]);

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "All" },
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
    ],
    []
  );

  const ageOptions = useMemo(
    () => [
      { value: "all", label: "All" },
      { value: "18-25", label: "18 - 25" },
      { value: "26-35", label: "26 - 35" },
      { value: "36-45", label: "36 - 45" },
      { value: "46+", label: "46+" },
    ],
    []
  );

  const truckOptions = useMemo(
    () => [{ value: "all", label: "All" }, ...trucks.map((t) => ({ value: t.id, label: t.licensePlate || t.id }))],
    [trucks]
  );

  const visibleDrivers = useMemo(() => {
    const q = (query || "").toLowerCase().trim();

    return drivers.filter((d) => {
      if (q) {
        const hay = [d.fullName, d.phone, d.email, d.truckName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (status !== "all" && d.status !== status) return false;
      if (age !== "all" && !isInAgeGroup(d.age, age)) return false;
      if (truck !== "all" && (d.truckId || "") !== truck) return false;

      return true;
    });
  }, [drivers, query, status, age, truck]);

  const assignTruck = (driverId, truckId, currentTruckId) => {
    // When clearing selection, unassign from the currently linked truck.
    if (!truckId) {
      if (!currentTruckId) return Promise.resolve();
      return apiFetch(`/trucks/${currentTruckId}`, { method: "PUT", body: { driver: null } })
        .then(() => Promise.all([mutateUsers(), mutateTrucks()]))
        .catch(() => null);
    }

    // Assign the user as the driver for the selected truck.
    // Backend handles syncing relationships.
    return apiFetch(`/trucks/${truckId}`, { method: "PUT", body: { driver: driverId } })
      .then(() => Promise.all([mutateUsers(), mutateTrucks()]))
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
          <h2>Drivers</h2>
          <p>Manage your drivers here.</p>
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
          onClick={() =>
            openOverlay("driver", {
              trucks: trucks.map((t) => ({ id: t.id, name: t.licensePlate || t.id })),
              afterSave: () => Promise.all([mutateUsers(), mutateTrucks()]),
            })
          }
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
            <SortByFilter label="Age" value={age} onChange={setAge} options={ageOptions} />
            <SortByFilter label="Truck" value={truck} onChange={setTruck} options={truckOptions} />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="card card-no-hpad flex-1 min-h-0" style={{ padding: 0, display: "flex", flexDirection: "column" }}>
        <DriversTable
          drivers={visibleDrivers}
          trucks={trucks.map((t) => ({ id: t.id, name: t.licensePlate || t.id }))}
          onAssignTruck={assignTruck}
        />
      </Card>
    </div>
  );
}
