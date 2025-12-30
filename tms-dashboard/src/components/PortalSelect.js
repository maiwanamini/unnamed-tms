"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Tooltip from "@/components/Tooltip";
import AvatarCircle from "@/components/AvatarCircle";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function PortalSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  triggerClassName = "",
  triggerStyle,
  menuClassName = "status-dropdown",
  menuStyle,
  searchable = true,
  searchPlaceholder = "Search...",
  alwaysShowSearch = false,
  maxVisibleItems = 6,
  showCaret = false,
  openOnMount = false,
  onClose,
}) {
  const [open, setOpen] = useState(Boolean(openOnMount));
  const [pos, setPos] = useState({ left: 0, top: 0, minWidth: 0, placement: "bottom" });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const [query, setQuery] = useState("");

  const canUseDOM = typeof window !== "undefined" && typeof document !== "undefined";

  const current = useMemo(() => {
    const found = (options || []).find((o) => String(o.value) === String(value));
    return found || null;
  }, [options, value]);

  const normalizedOptions = useMemo(() => (Array.isArray(options) ? options : []), [options]);

  const showSearch = useMemo(() => {
    if (!searchable) return false;
    if (alwaysShowSearch) return true;
    // Only show when it actually helps.
    return normalizedOptions.length > maxVisibleItems;
  }, [searchable, alwaysShowSearch, normalizedOptions.length, maxVisibleItems]);

  const filteredOptions = useMemo(() => {
    if (!showSearch) return normalizedOptions;
    const q = String(query || "").toLowerCase().trim();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter((o) => String(o.label || "").toLowerCase().includes(q));
  }, [normalizedOptions, query, showSearch]);

  const computePosition = () => {
    const el = triggerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const viewportW = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;

    const minWidth = Math.max(160, rect.width);
    const left = clamp(rect.left, 8, Math.max(8, viewportW - minWidth - 8));

    // default open below
    const top = rect.bottom + 8;
    setPos({ left, top, minWidth, placement: "bottom" });

    // flip to top if it would overflow (after menu renders)
    requestAnimationFrame(() => {
      const menu = menuRef.current;
      if (!menu) return;
      const mrect = menu.getBoundingClientRect();
      const wouldOverflowBottom = mrect.bottom > viewportH - 8;
      const canFitTop = rect.top - 8 - mrect.height >= 8;
      if (wouldOverflowBottom && canFitTop) {
        setPos({ left, top: rect.top - 8 - mrect.height, minWidth, placement: "top" });
      }
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    computePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    // Focus search each time.
    requestAnimationFrame(() => {
      searchRef.current?.focus?.();
    });

    const onDoc = (e) => {
      const t = e.target;
      if (triggerRef.current && triggerRef.current.contains(t)) return;
      if (menuRef.current && menuRef.current.contains(t)) return;
      setOpen(false);
      onClose?.();
    };

    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        onClose?.();
      }
    };

    const onReposition = () => computePosition();

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, onClose]);

  const label = current?.label || "";
  const hasSelection = value !== undefined && value !== null && String(value) !== "";

  // Keep the dropdown to ~6 rows and scroll beyond that.
  const itemHeight = 40;
  const headerHeight = showSearch ? 65 : 0;
  const maxHeight = headerHeight + maxVisibleItems * itemHeight + 16;
  const optionsMaxHeight = Math.max(120, maxHeight - headerHeight);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        style={triggerStyle}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => {
            const next = !v;
            if (next) setQuery("");
            return next;
          });
        }}
      >
        <span className="truncate" style={{ minWidth: 0, flex: "1 1 auto" }}>
          {label || placeholder}
        </span>

        {showCaret ? (
          <KeyboardArrowDownIcon
            aria-hidden="true"
            style={{ fontSize: 18, color: "#6b7280", marginLeft: 8, flex: "0 0 auto" }}
          />
        ) : null}
      </button>

      {canUseDOM && open
        ? createPortal(
            <div
              ref={menuRef}
              className={menuClassName}
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                minWidth: pos.minWidth,
                zIndex: 100000,
                /* Don't clip the arrow (::before/::after) or tooltips; scroll inside the options list instead. */
                overflow: "visible",
                ...menuStyle,
              }}
            >
              {showSearch ? (
                <div
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    background: "#ffffff",
                    padding: "0 0 12px 0",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <div className="status-search" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div className="search-box status-search-box" style={{ flex: 1 }}>
                      <SearchIcon className="search-icon" />
                      <input
                        ref={searchRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="search-input"
                      />
                    </div>

                    <Tooltip label={hasSelection ? "Clear selection" : ""} wrapperProps={{ style: { display: "inline-flex" } }}>
                      <button
                        type="button"
                        className={`status-search-clear ${hasSelection ? "active" : ""}`}
                        onClick={
                          hasSelection
                            ? () => {
                                setQuery("");
                                onChange?.("");
                                requestAnimationFrame(() => {
                                  searchRef.current?.focus?.();
                                });
                              }
                            : undefined
                        }
                        aria-label="Clear selection"
                        disabled={!hasSelection}
                      >
                        <DeleteIcon style={{ fontSize: 20 }} />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              ) : null}

              <div
                className="portal-select-options"
                style={{
                  maxHeight: optionsMaxHeight,
                  overflowY: "auto",
                  overflowX: "hidden",
                  paddingRight: 2,
                }}
              >
                {filteredOptions.map((opt) => {
                  const active = String(opt.value) === String(value);
                  const showAvatar =
                    opt &&
                    typeof opt === "object" &&
                    ("avatarUrl" in opt || "imageUrl" in opt || "photoUrl" in opt || "profileImageUrl" in opt);
                  const avatarUrl = opt?.avatarUrl || opt?.imageUrl || opt?.photoUrl || opt?.profileImageUrl || "";
                  return (
                    <div
                      key={String(opt.value)}
                      role="button"
                      tabIndex={0}
                      className={`custom-select-item portal-select-item ${active ? "active" : ""}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onChange?.(opt.value);
                        setOpen(false);
                        onClose?.();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onChange?.(opt.value);
                          setOpen(false);
                          onClose?.();
                        }
                      }}
                    >
                      {showAvatar ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <AvatarCircle
                            src={String(avatarUrl || "")}
                            name={String(opt.label || "")}
                            seed={String(opt.value || opt.label || "")}
                            size={24}
                          />
                          <span className="truncate" style={{ minWidth: 0, flex: "1 1 auto" }}>
                            {opt.label}
                          </span>
                        </div>
                      ) : (
                        opt.label
                      )}
                    </div>
                  );
                })}

                {showSearch && filteredOptions.length === 0 ? (
                  <div
                    className="custom-select-item portal-select-item"
                    style={{ color: "#6b7280", cursor: "default" }}
                  >
                    No results
                  </div>
                ) : null}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
