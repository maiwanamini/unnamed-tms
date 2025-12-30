"use client";

import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { CaretDown } from "@phosphor-icons/react";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@/components/Tooltip";

const baseSelectClassName =
  "auth-input h-11 mt-0 w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOptionsFromChildren(children) {
  const out = [];
  const visit = (node) => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!isValidElement(node)) return;

    // <option value="...">Label</option>
    if (String(node.type) === "option") {
      const value = node.props?.value ?? "";
      const label = node.props?.children ?? "";
      out.push({
        value: String(value),
        label: String(label),
        flagPng: node.props?.["data-flag-png"] ?? "",
        flagEmoji: node.props?.["data-flag-emoji"] ?? "",
        countryName: node.props?.["data-country-name"] ?? "",
      });
      return;
    }

    // <optgroup label="...">...</optgroup>
    if (String(node.type) === "optgroup") {
      const groupChildren = node.props?.children;
      Children.forEach(groupChildren, visit);
      return;
    }

    // Handle fragments or other wrappers.
    if (node.props?.children) {
      Children.forEach(node.props.children, visit);
    }
  };

  Children.forEach(children, visit);
  return out;
}

function makeSyntheticChangeEvent(nextValue) {
  return {
    target: { value: nextValue },
    currentTarget: { value: nextValue },
  };
}

const SelectInput = forwardRef(function SelectInput(
  {
    id,
    name,
    label,
    value,
    onChange,
    bare = false,
    children,
    disabled,
    required,
    showClear = true,
    selectClassName,
    wrapperClassName,
    labelClassName,
    helpText,
    error,
    renderValue,
    renderOption,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const helpId = helpText ? `${selectId}-help` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;

  const describedBy = [errorId, helpId].filter(Boolean).join(" ") || undefined;

  const canUseDOM = typeof window !== "undefined" && typeof document !== "undefined";
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const scrollRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hasScroll, setHasScroll] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const normalizedOptions = useMemo(() => normalizeOptionsFromChildren(children), [children]);
  const valueStr = value == null ? "" : String(value);
  const labelByValue = useMemo(() => {
    const out = {};
    for (const o of normalizedOptions) out[o.value] = o.label;
    return out;
  }, [normalizedOptions]);
  const selectedOption = useMemo(
    () => normalizedOptions.find((o) => String(o.value) === String(valueStr)) || null,
    [normalizedOptions, valueStr],
  );
  const selectedLabel = labelByValue[valueStr] ?? "";
  const placeholderLabel = normalizedOptions.find((o) => o.value === "")?.label || "Select";
  const hasSelection = Boolean(valueStr);

  const filteredOptions = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter((o) => {
      const hay = [o.label, o.countryName, o.value].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [normalizedOptions, query]);

  const measureHasScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setHasScroll(el.scrollHeight > el.clientHeight + 1);
  }, []);

  const updatePosition = useCallback(() => {
    if (!wrapperRef.current) return;
    const trigger = wrapperRef.current.querySelector("button[data-select-trigger]");
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!canUseDOM) return;

    function handleDoc(e) {
      const inDropdown = e.target && typeof e.target.closest === "function" && e.target.closest(".select-input-dropdown");
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
  }, [canUseDOM, updatePosition]);

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(measureHasScroll);
    return () => window.cancelAnimationFrame(id);
  }, [filteredOptions.length, measureHasScroll, open]);

  function choose(nextValue) {
    const next = String(nextValue ?? "");
    onChange?.(makeSyntheticChangeEvent(next));
    setOpen(false);
  }

  function clearSelection() {
    setQuery("");
    choose("");
  }

  const control = (
    <div ref={wrapperRef} className="relative">
      {/* Hidden select keeps form semantics + preserves forwarded ref expectations */}
      <select
        ref={ref}
        id={`${selectId}__native`}
        name={name}
        value={valueStr}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-hidden="true"
        tabIndex={-1}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, width: 0 }}
        {...rest}
      >
        {children}
      </select>

      <button
        id={selectId}
        type="button"
        data-select-trigger
        disabled={disabled}
        aria-describedby={describedBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          baseSelectClassName,
          "appearance-none pr-10 text-left flex items-center justify-between",
          disabled ? "opacity-70 cursor-default" : undefined,
          selectClassName,
        )}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
        }}
      >
        <span className={cn("truncate", hasSelection ? "text-slate-900" : "text-slate-500")}>
          {typeof renderValue === "function"
            ? renderValue({
                open,
                hasSelection,
                value: valueStr,
                selectedOption,
                selectedLabel,
                placeholderLabel,
              })
            : hasSelection
              ? selectedLabel
              : placeholderLabel}
        </span>
        <span className="pointer-events-none text-slate-500" aria-hidden="true">
          <CaretDown size={16} weight="bold" />
        </span>
      </button>

      {canUseDOM && open
        ? createPortal(
            <div
              ref={dropdownRef}
              className={`status-dropdown filter-checkbox-dropdown select-input-dropdown ${hasScroll ? "has-scroll" : "no-scroll"}`}
              style={{ position: "fixed", top: dropdownPos.top, left: dropdownPos.left, minWidth: dropdownPos.width || 280, zIndex: 9999 }}
            >
              <div ref={scrollRef} className="filter-checkbox-scroll">
                <div className="status-list">
                  <div className="status-search" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div className="search-box status-search-box" style={{ flex: 1 }}>
                      <SearchIcon className="search-icon" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search"
                        className="search-input"
                      />
                    </div>
                    {showClear ? (
                      <Tooltip label={hasSelection ? "Clear selection" : ""} wrapperProps={{ style: { display: "inline-flex" } }}>
                        <button
                          type="button"
                          className={`status-search-clear ${hasSelection ? "active" : ""}`}
                          onClick={hasSelection ? clearSelection : undefined}
                          aria-label="Clear selection"
                          disabled={!hasSelection}
                        >
                          <DeleteIcon style={{ fontSize: 20 }} />
                        </button>
                      </Tooltip>
                    ) : null}
                  </div>

                  {filteredOptions.map((o, idx) => (
                    <button
                      key={`${o.value}__${o.countryName || o.label || ""}__${idx}`}
                      type="button"
                      className={cn("status-item", valueStr === o.value ? "is-selected" : undefined)}
                      onClick={() => choose(o.value)}
                    >
                      <span className="filter-option-left">
                        <span className="status-btn truncate">
                          {typeof renderOption === "function" ? renderOption(o, { selected: valueStr === o.value }) : o.label}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );

  if (bare) return control;

  return (
    <div className={cn("flex flex-col gap-2", wrapperClassName)}>
      {label ? (
        <label htmlFor={selectId} className={cn("block text-sm font-medium text-slate-700", labelClassName)}>
          {label}
        </label>
      ) : null}

      {control}

      {helpText ? (
        <div id={helpId} className="text-xs text-slate-500 mt-1">
          {helpText}
        </div>
      ) : null}

      {error ? (
        <div id={errorId} className="text-xs text-red-600 mt-1" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
});

export default SelectInput;
