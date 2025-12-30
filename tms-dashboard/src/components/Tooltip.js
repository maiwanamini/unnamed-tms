"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Tooltip({
  label,
  placement = "top", // "top" | "bottom"
  children,
  wrapperClassName = "sidebar-tooltip-item",
  tooltipClassName = "sidebar-icon-tooltip",
  wrapperProps,
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const wrapperRef = useRef(null);

  const placementClass = placement === "bottom" ? " bottom" : "";

  const extraClassName = wrapperProps?.className ? ` ${wrapperProps.className}` : "";
  const {
    className: _ignoredClassName,
    onMouseEnter: wrapperOnMouseEnter,
    onMouseLeave: wrapperOnMouseLeave,
    onFocus: wrapperOnFocus,
    onBlur: wrapperOnBlur,
    ...restWrapperProps
  } = wrapperProps || {};

  const updatePosition = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = rect.left + rect.width / 2;
    const top = placement === "bottom" ? rect.bottom + 8 : rect.top - 8;
    setPos({ left, top });
  }, [placement]);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    function onScrollOrResize() {
      updatePosition();
    }

    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [open, updatePosition]);

  const canPortal = typeof document !== "undefined";

  return (
    <div
      ref={wrapperRef}
      className={`${wrapperClassName}${extraClassName}`}
      onMouseEnter={() => {
        if (!label) return;
        updatePosition();
        setOpen(true);
        wrapperOnMouseEnter?.();
      }}
      onMouseLeave={() => {
        setOpen(false);
        wrapperOnMouseLeave?.();
      }}
      onFocus={() => {
        if (!label) return;
        updatePosition();
        setOpen(true);
        wrapperOnFocus?.();
      }}
      onBlur={() => {
        setOpen(false);
        wrapperOnBlur?.();
      }}
      {...restWrapperProps}
    >
      {children}
      {label && open && canPortal
        ? createPortal(
            <div
              className={`${tooltipClassName}${placementClass}`}
              role="tooltip"
              style={{
                display: "block",
                position: "fixed",
                left: pos.left,
                top: pos.top,
                transform: placement === "bottom" ? "translate(-50%, 0)" : "translate(-50%, -100%)",
                zIndex: 2147483647,
                pointerEvents: "none",
              }}
            >
              {label}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
