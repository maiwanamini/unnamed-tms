"use client";

export default function Filter({ label, children, style }) {
  return (
    <div className="filter-wrapper" style={style}>
      <span className="filter-label">{label || '\u00A0'}</span>
      {children}
    </div>
  );
}
