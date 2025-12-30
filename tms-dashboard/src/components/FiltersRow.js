"use client";

import Filter from "@/components/Filter";
import SearchIcon from "@mui/icons-material/Search";
import StatusFilter from "@/components/StatusFilter";
import DateRangeFilter from "@/components/DateRangeFilter";
import FilterCheckboxSelect from "@/components/FilterCheckboxSelect";

export default function FiltersRow({
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  statusCounts,
  dateRange,
  setDateRange,
  customer,
  setCustomer,
  customerOptions,
  customerCounts,
  truck,
  setTruck,
  truckOptions,
  truckCounts,
  children,
}) {
  function clearFilters() {
    if (setQuery) setQuery("");
    if (setStatusFilter) setStatusFilter([]);
    if (setDateRange) setDateRange({ start: null, end: null });
    if (setCustomer) setCustomer([]);
    if (setTruck) setTruck([]);
  }

  const hasFilters = Boolean(
    (query && query.toString().trim() !== "") ||
      (statusFilter && statusFilter.length > 0) ||
      (dateRange && (dateRange.start || dateRange.end)) ||
      (Array.isArray(customer) && customer.length > 0) ||
      (Array.isArray(truck) && truck.length > 0)
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
      <StatusFilter statusFilter={statusFilter} setStatusFilter={setStatusFilter} counts={statusCounts} />

      {children}

      {Array.isArray(customerOptions) && customerOptions.length > 0 ? (
        <FilterCheckboxSelect
          label="Customer"
          value={Array.isArray(customer) ? customer : []}
          onChange={setCustomer}
          placeholder="All"
          options={customerOptions.filter((o) => String(o?.value ?? o) !== "all")}
          counts={customerCounts}
        />
      ) : null}

      {Array.isArray(truckOptions) && truckOptions.length > 0 ? (
        <FilterCheckboxSelect
          label="Truck"
          value={Array.isArray(truck) ? truck : []}
          onChange={setTruck}
          placeholder="All"
          options={truckOptions.filter((o) => String(o?.value ?? o) !== "all")}
          counts={truckCounts}
        />
      ) : null}
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
