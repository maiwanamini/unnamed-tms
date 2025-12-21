"use client";

import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import Card from "@/components/Card";
import Filter from "@/components/Filter";
import SortByFilter from "@/components/SortByFilter";
import CustomersTable from "@/components/CustomersTable";
import { useOverlay } from "@/hooks/useOverlay";
import { useCustomers } from "@/hooks/useCustomers";

const PLACEHOLDER_CUSTOMERS = Array.from({ length: 20 }).map((_, i) => {
  const n = i + 1;
  const dayNum = (n % 28) + 1;
  const monthNum = ((n + 3) % 12) + 1;
  const day = String(dayNum).padStart(2, "0");
  const month = String(monthNum).padStart(2, "0");
  const year = 2021 + (n % 4);

  return {
    id: `C-${String(n).padStart(2, "0")}`,
    name: n === 1 ? "MILMAS BV" : "Client name",
    contactName: n === 1 ? "Milad Amini" : "Contact Name",
    phone: "+3233221122",
    email: n === 1 ? "planning@milmas.be" : "name@mail.com",
    address: "Address",
    createdAt: new Date(Date.UTC(year, monthNum - 1, dayNum)).toISOString(),
  };
});

export default function CustomersPage() {
  const { openOverlay } = useOverlay();
  const { customers, isLoading } = useCustomers();

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAtDesc");

  const sortOptions = useMemo(
    () => [
      { value: "createdAtDesc", label: "Latest created" },
      { value: "createdAtAsc", label: "Oldest created" },
      { value: "nameAsc", label: "Full Name (A-Z)" },
      { value: "nameDesc", label: "Full Name (Z-A)" },
    ],
    []
  );

  const sourceCustomers = (customers?.length || 0) > 0 ? customers : PLACEHOLDER_CUSTOMERS;

  const visibleCustomers = useMemo(() => {
    const q = (query || "").toLowerCase().trim();
    const filtered = !q
      ? sourceCustomers
      : sourceCustomers.filter((c) => {
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
  }, [sourceCustomers, query, sortBy]);

  // If we're showing placeholders, avoid the loading flash.
  const showLoading = isLoading && (customers?.length || 0) === 0 && sourceCustomers === customers;

  return (
    <>
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

        {/* Filters row (Search + Sort only) */}
        <Card className="card header-card" style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
          <div className="w-full flex flex-wrap gap-x-2 gap-y-2">
            <div className="filters-row flex flex-wrap gap-2 w-full items-end" style={{ marginTop: 0, marginBottom: 0 }}>
              <Filter label={"Search"}>
                <div className="search-box" style={{ width: 242 }}>
                  <SearchIcon className="search-icon" />
                  <input
                    className="search-input"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </Filter>
              <div style={{ width: 1, height: 40, backgroundColor: "#e5e7eb", alignSelf: "flex-end" }} />
              <SortByFilter value={sortBy} onChange={setSortBy} options={sortOptions} />
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="card card-no-hpad flex-1 min-h-0" style={{ padding: 0, display: "flex", flexDirection: "column" }}>
          {showLoading ? <p style={{ padding: 16 }}>Loading customers…</p> : <CustomersTable customers={visibleCustomers} />}
        </Card>
      </div>
    </>
  );
}
