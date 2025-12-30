"use client";

import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import Card from "@/components/Card";
import Filter from "@/components/Filter";
import SortByFilter from "@/components/SortByFilter";
import CustomersTable from "@/components/CustomersTable";
import CustomerDetailPanel from "@/components/CustomerDetailPanel";
import { useOverlay } from "@/hooks/useOverlay";
import { useCustomers } from "@/hooks/useCustomers";
import { apiFetch } from "@/lib/fetcher";

export default function CustomersPage() {
  const { openOverlay } = useOverlay();
  const { customers, isLoading, mutate } = useCustomers();

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAtDesc");
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const sortOptions = useMemo(
    () => [
      { value: "createdAtDesc", label: "Latest created" },
      { value: "createdAtAsc", label: "Oldest created" },
      { value: "nameAsc", label: "Full Name (A-Z)" },
      { value: "nameDesc", label: "Full Name (Z-A)" },
    ],
    []
  );

  const visibleCustomers = useMemo(() => {
    const q = (query || "").toLowerCase().trim();
    const filtered = !q
      ? customers
      : customers.filter((c) => {
          const hay = [
            c?.name,
            c?.contactName,
            c?.phone,
            c?.email,
            typeof c?.address === "string" ? c.address : "",
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        });

    const getTime = (c) => {
      const v = c?.createdAt || c?.created_at;
      const t = v ? new Date(v).getTime() : 0;
      return Number.isNaN(t) ? 0 : t;
    };

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortBy === "createdAtAsc") return getTime(a) - getTime(b);
      if (sortBy === "createdAtDesc") return getTime(b) - getTime(a);
      if (sortBy === "nameDesc") return String(b?.name || "").localeCompare(String(a?.name || ""));
      return String(a?.name || "").localeCompare(String(b?.name || ""));
    });

    return sorted;
  }, [customers, query, sortBy]);

  // Close panel if the selected row is no longer visible.
  const selectedId = selected?.id;
  const resolvedSelected = useMemo(() => {
    if (!selectedId) return null;
    return visibleCustomers.find((c) => c.id === selectedId) || null;
  }, [selectedId, visibleCustomers]);

  const showLoading = Boolean(isLoading);

  const handleEdit = () => {
    if (!resolvedSelected) return;
    openOverlay("customer", { mode: "edit", customer: resolvedSelected });
  };

  const handleDelete = async () => {
    if (!resolvedSelected?.id) return;
    setDeleting(true);
    try {
      await apiFetch(`/clients/${resolvedSelected.id}`, { method: "DELETE" });
      await mutate();
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
            <h2>Customers</h2>
            <p>Manage your customer list here.</p>
          </div>
          <button
            className="btn-primary"
            onClick={() => openOverlay("customer")}
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
                  <SortByFilter value={sortBy} onChange={setSortBy} options={sortOptions} />
                </div>
              </div>
            </Card>

            <Card className="card card-no-hpad flex-1 min-h-0" style={{ minWidth: 0, padding: 0, display: "flex", flexDirection: "column" }}>
              {showLoading ? (
                <p style={{ padding: 16 }}>Loading customers…</p>
              ) : (
                <CustomersTable customers={visibleCustomers} selected={resolvedSelected} setSelected={setSelected} />
              )}
            </Card>
          </div>

          {/* Right column: detail panel */}
          {resolvedSelected ? (
            <aside className="w-full flex flex-col bg-white min-h-0" style={{ flexShrink: 0, height: "100%", overflow: "hidden" }}>
              <CustomerDetailPanel
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
