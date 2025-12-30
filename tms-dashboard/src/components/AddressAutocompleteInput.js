"use client";

import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import TextInput from "@/components/TextInput";
import { apiFetch } from "@/lib/fetcher";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

// Returns suggestions:
// { id, label, placeName, lat, lng, city, postalCode }
const AddressAutocompleteInput = forwardRef(function AddressAutocompleteInput(
  {
    value,
    onChangeText,
    onSelect,
    placeholder,
    disabled,
    inputClassName,
  },
  ref,
) {
  const generatedId = useId();
  const inputId = `addr_${generatedId}`;

  const canUseDOM = typeof window !== "undefined" && typeof document !== "undefined";
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const mergedRef = useCallback(
    (node) => {
      inputRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref && typeof ref === "object") ref.current = node;
    },
    [ref],
  );

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const suppressNextClickRef = useRef(false);

  const debounceTimerRef = useRef(null);
  const requestSeqRef = useRef(0);

  const updatePosition = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 8, left: rect.left, width: rect.width });
  }, []);

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!canUseDOM) return;

    function handleDoc(e) {
      const inDropdown = e.target && typeof e.target.closest === "function" && e.target.closest(".address-autocomplete-dropdown");
      if (inDropdown) return;
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
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

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      requestSeqRef.current += 1; // invalidate any in-flight promises
    };
  }, []);

  const runAutocomplete = useCallback(
    (qRaw) => {
      const q = String(qRaw || "").trim();

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      if (disabled || q.length < 3) {
        requestSeqRef.current += 1;
        setLoading(false);
        setItems([]);
        setOpen(false);
        return;
      }

      const seq = (requestSeqRef.current += 1);
      setLoading(true);

      debounceTimerRef.current = setTimeout(() => {
        apiFetch(`/geo/autocomplete?q=${encodeURIComponent(q)}`)
          .then((data) => {
            if (seq !== requestSeqRef.current) return;
            const list = Array.isArray(data) ? data : [];
            setItems(list);
            setOpen(list.length > 0);
          })
          .catch(() => {
            if (seq !== requestSeqRef.current) return;
            setItems([]);
            setOpen(false);
          })
          .finally(() => {
            if (seq !== requestSeqRef.current) return;
            setLoading(false);
          });
      }, 250);
    },
    [disabled],
  );

  const selectItem = useCallback(
    (it) => {
      onSelect?.(it);
      setOpen(false);
    },
    [onSelect],
  );

  const dropdown =
    canUseDOM && open
      ? createPortal(
          <div
            className={cn(
              "status-dropdown filter-checkbox-dropdown select-input-dropdown",
              "address-autocomplete-dropdown",
            )}
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              minWidth: dropdownPos.width || 280,
              zIndex: 9999,
              padding: 12,
            }}
            role="listbox"
          >
            <div className="status-list">
              {items.map((it, idx) => (
                <button
                  key={`${it?.id || it?.label || "item"}__${idx}`}
                  type="button"
                  className="status-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    suppressNextClickRef.current = true;
                    selectItem(it);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    suppressNextClickRef.current = true;
                    selectItem(it);
                  }}
                  onClick={() => {
                    if (suppressNextClickRef.current) {
                      suppressNextClickRef.current = false;
                      return;
                    }
                    selectItem(it);
                  }}
                >
                  <span className="filter-option-left">
                    <span className="status-btn truncate">{String(it?.label || "")}</span>
                  </span>
                </button>
              ))}
              {loading ? (
                <div className="text-xs text-slate-500" style={{ padding: "6px 10px" }}>
                  Searching…
                </div>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={wrapRef} className="relative">
      <TextInput
        ref={mergedRef}
        bare
        id={inputId}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          onChangeText?.(next);
          runAutocomplete(next);
        }}
        inputClassName={inputClassName}
        autoComplete="off"
        onFocus={() => {
          if (items.length > 0) setOpen(true);
        }}
      />
      {dropdown}
    </div>
  );
});

export default AddressAutocompleteInput;
