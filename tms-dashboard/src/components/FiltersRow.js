"use client";

import Filter from "@/components/Filter";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import StatusFilter from '@/components/StatusFilter';
import DateRangeFilter from "@/components/DateRangeFilter";

export default function FiltersRow({ query, setQuery, statusFilter, setStatusFilter, dateRange, setDateRange }) {
  function clearFilters() {
    if (setQuery) setQuery("");
    if (setStatusFilter) setStatusFilter([]);
    if (setDateRange) setDateRange({ start: null, end: null });
  }

  const hasFilters = Boolean(
    (query && query.toString().trim() !== "") ||
      (statusFilter && statusFilter.length > 0) ||
      (dateRange && (dateRange.start || dateRange.end))
  );

  return (
    <div className="filters-row flex flex-wrap gap-2 w-full items-end" style={{ marginTop: 0, marginBottom: 0 }}>
      <Filter label={"Search"}>
        <div className="search-box" style={{ width: 242 }}>
          <SearchIcon className="search-icon" />
          <input className="search-input" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </Filter>
      <div style={{ width: 1, height: 40, backgroundColor: "#e5e7eb", alignSelf: "flex-end" }}></div>
      <DateRangeFilter label="Choose Date" value={dateRange} onChange={setDateRange} />
      <StatusFilter statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
      <Filter label={"Customer"}>
        <button className="filter min-w-[120px] max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="truncate">All</span>
          <KeyboardArrowDownIcon className="shrink-0" style={{ fontSize: 16, color: "#6b7280" }} />
        </button>
      </Filter>
      <Filter label={"Truck"}>
        <button className="filter min-w-[120px] max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="truncate">All</span>
          <KeyboardArrowDownIcon className="shrink-0" style={{ fontSize: 16, color: "#6b7280" }} />
        </button>
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
