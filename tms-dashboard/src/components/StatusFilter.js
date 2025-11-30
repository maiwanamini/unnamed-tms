"use client";

import { useState, useRef, useEffect } from "react";
import Filter from "@/components/Filter";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

const STATUSES = ["Moving", "Pending", "Completed", "Canceled"];

export default function StatusFilter({ statusFilter, setStatusFilter, label = "Status" }) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusQuery, setStatusQuery] = useState("");

  const statusRef = useRef(null);

  useEffect(() => {
    function handleDoc(e) {
      if (!statusRef.current) return;
      if (!statusRef.current.contains(e.target)) {
        setStatusOpen(false);
      }
    }

    function handleKey(e) {
      if (e.key === "Escape") setStatusOpen(false);
    }

    document.addEventListener("mousedown", handleDoc);
    document.addEventListener("touchstart", handleDoc);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleDoc);
      document.removeEventListener("touchstart", handleDoc);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  function toggleStatus(s) {
    if (!setStatusFilter) return;
    const cur = statusFilter || [];
    if (cur.includes(s)) {
      setStatusFilter(cur.filter((x) => x !== s));
    } else {
      setStatusFilter([...cur, s]);
    }
  }

  const statusLabel = !statusFilter || statusFilter.length === 0 ? "All" : statusFilter.join(", ");
  const hasSelection = !!(statusFilter && statusFilter.length > 0);

  return (
    <Filter label={label}>
      <div ref={statusRef} style={{ position: "relative" }}>
        <button className="filter" onClick={() => setStatusOpen((v) => !v)}>
          <span>{statusLabel}</span>
          <KeyboardArrowDownIcon className={`status-chevron ${statusOpen ? 'open' : ''}`} style={{ fontSize: 16, color: "#6b7280" }} />
        </button>
        {statusOpen && (
          <div className="status-dropdown">
            <div className="status-list">
              <div className="status-search" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div className="search-box status-search-box" style={{ flex: 1 }}>
                  <SearchIcon className="search-icon" />
                  <input value={statusQuery} onChange={(e) => setStatusQuery(e.target.value)} placeholder="Search for filter..." className="search-input" />
                </div>
                <button
                  type="button"
                  className={`status-search-clear ${hasSelection ? 'active' : ''}`}
                  onClick={hasSelection ? () => { setStatusQuery(""); if (setStatusFilter) setStatusFilter([]); } : undefined}
                  aria-label="Delete search"
                  title="Clear"
                  disabled={!hasSelection}
                >
                  <DeleteIcon style={{ fontSize: 20 }} />
                  <span className="status-clear-tooltip" aria-hidden="true">Clear filter</span>
                </button>
              </div>

              <label className="status-item">
                <input className="status-checkbox status-checkbox-all" type="checkbox" checked={!statusFilter || statusFilter.length === 0} onChange={() => setStatusFilter([])} />
                <span className="status-btn">All</span>
              </label>

              {STATUSES.filter(s => s.toLowerCase().includes(statusQuery.toLowerCase())).map((s) => {
                const Icon =
                  s === 'Moving'
                    ? ArrowCircleRightOutlinedIcon
                    : s === 'Pending'
                    ? AccessTimeOutlinedIcon
                    : s === 'Completed'
                    ? CheckCircleOutlineIcon
                    : CancelOutlinedIcon;
                return (
                  <label key={s} className="status-item">
                    <input className={`status-checkbox status-checkbox-${s.toLowerCase()}`} type="checkbox" checked={(statusFilter || []).includes(s)} onChange={() => toggleStatus(s)} />
                    <span className={`status-btn status-btn-${s.toLowerCase()}`}>
                      <Icon className="status-item-icon" fontSize="small" />
                      {s}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Filter>
  );
}
