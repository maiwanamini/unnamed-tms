"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Filter from "@/components/Filter";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function SortByFilter({ value, onChange, options, label = "Sort by" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  function updatePosition() {
    if (!ref.current) return;
    const trigger = ref.current.querySelector("button.filter");
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 8 + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }

  useEffect(() => {
    function handleDoc(e) {
      const inDropdown = e.target && typeof e.target.closest === "function" && e.target.closest(".sortby-dropdown");
      if (inDropdown) return;
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
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

  useEffect(() => {
    if (open) updatePosition();
  }, [open]);

  const current = options.find((o) => o.value === value) || options[0];

  return (
    <Filter label={label}>
      <div ref={ref} style={{ position: "relative" }}>
        <button
          type="button"
          className="filter min-w-[160px] max-w-[260px] whitespace-nowrap overflow-hidden text-ellipsis"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="truncate">{current?.label || ""}</span>
          <KeyboardArrowDownIcon
            className={`status-chevron ${open ? "open" : ""} shrink-0`}
            style={{ fontSize: 16, color: "#6b7280" }}
          />
        </button>

        {open
          ? createPortal(
              <div
                className="status-dropdown sortby-dropdown"
                style={{ position: "absolute", top: dropdownPos.top, left: dropdownPos.left, minWidth: 220, padding: 8, zIndex: 9999 }}
              >
                {options.map((opt) => {
                  const active = opt.value === value;
                  return (
                    <div
                      key={opt.value}
                      role="button"
                      tabIndex={0}
                      className={`custom-select-item ${active ? "active" : ""}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onChange(opt.value);
                          setOpen(false);
                        }
                      }}
                    >
                      {opt.label}
                    </div>
                  );
                })}
              </div>,
              document.body,
            )
          : null}
      </div>
    </Filter>
  );
}
