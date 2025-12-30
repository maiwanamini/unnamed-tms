"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Filter from "@/components/Filter";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@/components/Tooltip";

function normalizeOptions(options) {
  return (Array.isArray(options) ? options : []).map((o) => {
    if (o && typeof o === "object") {
      return { value: String(o.value ?? ""), label: String(o.label ?? o.value ?? "") };
    }
    return { value: String(o ?? ""), label: String(o ?? "") };
  });
}

export default function FilterCheckboxSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "All",
  counts,
  multiple = true,
  allValue,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hasScroll, setHasScroll] = useState(false);

  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const scrollRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const normalizedOptions = useMemo(() => normalizeOptions(options), [options]);
  const valueToLabel = useMemo(() => {
    const out = {};
    for (const o of normalizedOptions) out[o.value] = o.label;
    return out;
  }, [normalizedOptions]);

  const selectedValues = useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value.map(String) : [];
    }

    const v = value == null ? null : String(value);
    const all = allValue == null ? null : String(allValue);
    if (!v) return [];
    if (all != null && v === all) return [];
    return [v];
  }, [allValue, multiple, value]);

  const hasSelection = selectedValues.length > 0;

  const labelText = useMemo(() => {
    if (!hasSelection) return placeholder;
    const labels = selectedValues.map((v) => valueToLabel[v] || v);
    return multiple ? labels.join(", ") : (labels[0] || placeholder);
  }, [hasSelection, multiple, placeholder, selectedValues, valueToLabel]);

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter((o) => String(o.label || "").toLowerCase().includes(q));
  }, [normalizedOptions, query]);

  const measureHasScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setHasScroll(el.scrollHeight > el.clientHeight + 1);
  }, []);

  const countsMap = useMemo(() => {
    if (!counts || typeof counts !== "object") return null;
    const out = {};
    for (const [k, v] of Object.entries(counts)) {
      const n = Number(v);
      out[String(k)] = Number.isFinite(n) ? n : 0;
    }
    return out;
  }, [counts]);

  const totalCount = useMemo(() => {
    if (!countsMap) return null;
    return Object.values(countsMap).reduce((a, b) => a + (Number(b) || 0), 0);
  }, [countsMap]);

  function updatePosition() {
    if (!wrapperRef.current) return;
    const trigger = wrapperRef.current.querySelector("button.filter");
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }

  useEffect(() => {
    function handleDoc(e) {
      const inDropdown = e.target && typeof e.target.closest === "function" && e.target.closest(".filter-checkbox-dropdown");
      if (inDropdown) return;
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) setOpen(false);
    }

    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleDoc);
    document.addEventListener("touchstart", handleDoc);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("mousedown", handleDoc);
      document.removeEventListener("touchstart", handleDoc);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, []);

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(measureHasScroll);
    return () => window.cancelAnimationFrame(id);
  }, [open, filtered.length, measureHasScroll]);

  useEffect(() => {
    if (!open) return;
    function handleResize() {
      window.requestAnimationFrame(measureHasScroll);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open, measureHasScroll]);

  function emitAll() {
    if (multiple) {
      onChange?.([]);
    } else {
      onChange?.(allValue);
    }
  }

  function toggleValue(nextValue) {
    const v = String(nextValue);
    const cur = selectedValues;

    if (!multiple) {
      const next = cur.includes(v) ? [] : [v];
      if (next.length === 0) {
        emitAll();
      } else {
        onChange?.(v);
      }
      setOpen(false);
      return;
    }

    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    onChange?.(next);
  }

  function clearAll() {
    setQuery("");
    emitAll();
  }

  return (
    <Filter label={label}>
      <div ref={wrapperRef} className="filter-checkbox-wrapper">
        <button
          className="filter min-w-[120px] max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <span className="truncate">{labelText}</span>
          <KeyboardArrowDownIcon className={`status-chevron ${open ? "open" : ""} shrink-0`} style={{ fontSize: 16, color: "#6b7280" }} />
        </button>

        {open
          ? createPortal(
              <div
                ref={dropdownRef}
                className={`status-dropdown filter-checkbox-dropdown ${hasScroll ? "has-scroll" : "no-scroll"}`}
                style={{ position: "fixed", top: dropdownPos.top, left: dropdownPos.left, minWidth: 280, zIndex: 9999 }}
              >
                <div ref={scrollRef} className="filter-checkbox-scroll">
                  <div className="status-list">
                    <div className="status-search" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div className="search-box status-search-box" style={{ flex: 1 }}>
                        <SearchIcon className="search-icon" />
                        <input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search for filter..."
                          className="search-input"
                        />
                      </div>
                      <Tooltip label={hasSelection ? "Clear filter" : ""} wrapperProps={{ style: { display: "inline-flex" } }}>
                        <button
                          type="button"
                          className={`status-search-clear ${hasSelection ? "active" : ""}`}
                          onClick={hasSelection ? clearAll : undefined}
                          aria-label="Clear filter"
                          disabled={!hasSelection}
                        >
                          <DeleteIcon style={{ fontSize: 20 }} />
                        </button>
                      </Tooltip>
                    </div>

                    <label className="status-item">
                      <span className="filter-option-left">
                        <input
                          className="status-checkbox status-checkbox-all"
                          type="checkbox"
                          checked={!hasSelection}
                          onChange={() => emitAll()}
                        />
                        <span className="status-btn truncate">{placeholder}</span>
                      </span>
                      {countsMap ? <span className="filter-option-count">{totalCount ?? 0}</span> : null}
                    </label>

                    {filtered.map((o) => (
                      <label key={o.value} className="status-item">
                        <span className="filter-option-left">
                          <input
                            className="status-checkbox"
                            type="checkbox"
                            checked={selectedValues.includes(o.value)}
                            onChange={() => toggleValue(o.value)}
                          />
                          <span className="status-btn truncate">{o.label}</span>
                        </span>
                        {countsMap ? <span className="filter-option-count">{countsMap[o.value] ?? 0}</span> : null}
                      </label>
                    ))}
                  </div>
                </div>
              </div>,
              document.body,
            )
          : null}
      </div>
    </Filter>
  );
}
