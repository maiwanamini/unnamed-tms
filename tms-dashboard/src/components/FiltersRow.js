"use client";

import { useState } from "react";
import Filter from "@/components/Filter";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import StatusFilter from '@/components/StatusFilter';

const STATUSES = ["Moving", "Pending", "Completed", "Canceled"];

export default function FiltersRow({ query, setQuery, statusFilter, setStatusFilter }) {
  function clearFilters() {
    if (setQuery) setQuery("");
    if (setStatusFilter) setStatusFilter([]);
  }

  const statusLabel = !statusFilter || statusFilter.length === 0 ? "All" : statusFilter.join(", ");
  const hasFilters = Boolean((query && query.toString().trim() !== '') || (statusFilter && statusFilter.length > 0));

  return (
    <div className="filters-row" style={{ marginTop: 0, marginBottom: 0 }}>
      <Filter label={"Search"}>
        <div className="search-box" style={{ width: 242 }}>
          <SearchIcon className="search-icon" />
          <input className="search-input" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </Filter>
      <div style={{ width: 1, height: 40, backgroundColor: "#e5e7eb", alignSelf: "flex-end" }}></div>
      <Filter label={"Choose Date"}>
        <button className="filter"><span>All</span><KeyboardArrowDownIcon style={{ fontSize: 16, color: "#6b7280" }} /></button>
      </Filter>
      <StatusFilter statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
      <Filter label={"Client"}>
        <button className="filter"><span>All</span><KeyboardArrowDownIcon style={{ fontSize: 16, color: "#6b7280" }} /></button>
      </Filter>
      <Filter label={"Truck"}>
        <button className="filter"><span>All</span><KeyboardArrowDownIcon style={{ fontSize: 16, color: "#6b7280" }} /></button>
      </Filter>
      {hasFilters && (
        <Filter style={{ marginLeft: "auto" }}>
          <div
            role="button"
            tabIndex={0}
            onClick={clearFilters}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') clearFilters(); }}
            style={{ height: 40, display: "flex", alignItems: "center", color: "#6b7280", fontSize: 14, gap: 6, cursor: "pointer", fontWeight: 700 }}
          >
            CLEAR FILTERS
          </div>
        </Filter>
      )}
    </div>
  );
}
