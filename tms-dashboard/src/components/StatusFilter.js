"use client";

import FilterCheckboxSelect from "@/components/FilterCheckboxSelect";

const STATUSES = ["Moving", "Pending", "Completed", "Canceled"];

export default function StatusFilter({ statusFilter, setStatusFilter, label = "Status", counts }) {
  return (
    <FilterCheckboxSelect
      label={label}
      value={Array.isArray(statusFilter) ? statusFilter : []}
      onChange={setStatusFilter}
      options={STATUSES}
      placeholder="All"
      counts={counts}
    />
  );
}
