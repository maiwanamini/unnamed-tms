"use client";

import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import Card from "@/components/Card";
import Filter from "@/components/Filter";
import SortByFilter from "@/components/SortByFilter";
import DriversTable from "@/components/DriversTable";
import { useOverlay } from "@/hooks/useOverlay";

const PLACEHOLDER_TRUCKS = [
  { id: "TR-01", name: "Truck" },
  { id: "TR-02", name: "Truck" },
  { id: "TR-03", name: "Truck" },
];

const PLACEHOLDER_DRIVERS = Array.from({ length: 12 }).map((_, i) => {
  const n = i + 1;
  const dayNum = (n % 28) + 1;
  const monthNum = ((n + 3) % 12) + 1;
  const year = 2021;
  const createdAt = new Date(Date.UTC(year, monthNum - 1, dayNum)).toISOString();
  const status = n % 4 === 0 ? "Inactive" : "Active";

  const ages = [22, 27, 31, 38, 44, 51];
  const age = ages[n % ages.length];

  const hasTruck = n % 3 !== 0;
  const truck = hasTruck ? PLACEHOLDER_TRUCKS[n % PLACEHOLDER_TRUCKS.length] : null;

  return {
    id: `DR-${String(n).padStart(2, "0")}`,
    fullName: "Full Name",
    status,
    phone: "+3233221122",
    email: "driver@mail.com",
    age,
    truckId: truck?.id || "",
    truckName: truck?.name || "",
    createdAt,
    avatarUrl: "",
  };
});

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
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [age, setAge] = useState("all");
  const [truck, setTruck] = useState("all");

  const [drivers, setDrivers] = useState(PLACEHOLDER_DRIVERS);

  const handleCreateDriver = (driver) => {
    setDrivers((prev) => [driver, ...prev]);
  };

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
    () => [{ value: "all", label: "All" }, ...PLACEHOLDER_TRUCKS.map((t) => ({ value: t.id, label: t.name }))],
    []
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

  const assignTruck = (driverId, truckId) => {
    const t = PLACEHOLDER_TRUCKS.find((x) => x.id === truckId);
    if (!t) return;
    setDrivers((prev) => prev.map((d) => (d.id === driverId ? { ...d, truckId: t.id, truckName: t.name } : d)));
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
          onClick={() => openOverlay("driver", { trucks: PLACEHOLDER_TRUCKS, onCreate: handleCreateDriver })}
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
        <DriversTable drivers={visibleDrivers} trucks={PLACEHOLDER_TRUCKS} onAssignTruck={assignTruck} />
      </Card>
    </div>
  );
}
