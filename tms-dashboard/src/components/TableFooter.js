"use client";

import React, { useState, useRef, useEffect } from "react";

const OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 5, label: '5 rows' },
  { value: 10, label: '10 rows' },
  { value: 25, label: '25 rows' },
  { value: 50, label: '50 rows' },
];

export default function TableFooter({ rowsPerPage, setRowsPerPage, page, setPage, total = 0 }) {
  const isAll = rowsPerPage === Infinity;
  const start = total === 0 ? 0 : isAll ? 1 : Math.min(page * rowsPerPage + 1, total);
  const end = total === 0 ? 0 : isAll ? total : Math.min((page + 1) * rowsPerPage, total);

  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);

  // close on outside click
  useEffect(() => {
    function onDoc(e) {
      if (!toggleRef.current) return;
      if (!toggleRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const currentLabel = isAll ? 'All' : `${rowsPerPage} rows`;

  function handleSelect(v) {
    const newVal = v === 'all' ? Infinity : Number(v);
    setRowsPerPage(newVal);
    setPage(0);
    setOpen(false);
  }

  return (
    <div className="table-footer" data-testid="table-footer">
      <div className="rows-select" ref={toggleRef}>
        <label style={{ marginRight: 8, color: '#6b7280', fontSize: 13 }}>Display</label>

        <div className={`custom-select ${open ? 'open' : ''}`}>
          <button
            type="button"
            className="custom-select-trigger"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
          >
            <span className="custom-select-value">{currentLabel}</span>
            <span className="custom-select-caret" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </span>
          </button>

          {open && (
            <div className="custom-select-menu" role="listbox">
              {OPTIONS.map((opt) => {
                const val = opt.value;
                const active = (val === 'all' && isAll) || (val !== 'all' && rowsPerPage === Number(val));
                return (
                  <div
                    key={String(val)}
                    role="option"
                    aria-selected={active}
                    tabIndex={0}
                    className={`custom-select-item ${active ? 'active' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(val); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(val); } }}
                  >
                    {opt.label}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="page-info" style={{ color: '#6b7280', marginLeft: 12 }}>
        {total === 0 ? '0 of 0' : `${start}-${end} of ${total}`}
      </div>

      {!isAll && (
        <div style={{ marginLeft: 'auto' }} className="pager-buttons">
          <button
            className="btn-ghost"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Previous page"
          >
            PREV
          </button>
          <button
            className="btn-ghost"
            onClick={() => setPage((p) => (p + 1) * rowsPerPage < total ? p + 1 : p)}
            disabled={(page + 1) * rowsPerPage >= total}
            aria-label="Next page"
            style={{ marginLeft: 8 }}
          >
            NEXT
          </button>
        </div>
      )}
    </div>
  );
}
