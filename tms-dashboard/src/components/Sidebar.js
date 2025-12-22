"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { CaretDown, Garage, Headset, Package, Seatbelt, Truck, TruckTrailer, UserCircle, Users } from "@phosphor-icons/react";

export default function Sidebar() {
  const pathname = usePathname() || "";
  const router = useRouter();

  const dispatchRoutes = useMemo(() => new Set(["/dashboard/orders", "/dashboard/customers"]), []);
  const fleetRoutes = useMemo(() => new Set(["/dashboard/trucks", "/dashboard/trailers", "/dashboard/drivers"]), []);

  const isDispatchActive = dispatchRoutes.has(pathname);
  const isFleetActive = fleetRoutes.has(pathname);

  const [dispatchOpen, setDispatchOpen] = useState(isDispatchActive);
  const [fleetOpen, setFleetOpen] = useState(isFleetActive);
  const [collapsed, setCollapsed] = useState(false);
  const [openFlyout, setOpenFlyout] = useState(null);
  const flyoutCloseTimerRef = useRef(null);

  useEffect(() => {
    if (isDispatchActive) setDispatchOpen(true);
    if (isFleetActive) setFleetOpen(true);
  }, [isDispatchActive, isFleetActive]);

  useEffect(() => {
    return () => {
      if (flyoutCloseTimerRef.current) {
        window.clearTimeout(flyoutCloseTimerRef.current);
      }
    };
  }, []);

  const openFlyoutFor = (key) => {
    if (flyoutCloseTimerRef.current) {
      window.clearTimeout(flyoutCloseTimerRef.current);
      flyoutCloseTimerRef.current = null;
    }
    setOpenFlyout(key);
  };

  const scheduleCloseFlyout = () => {
    if (flyoutCloseTimerRef.current) {
      window.clearTimeout(flyoutCloseTimerRef.current);
    }
    flyoutCloseTimerRef.current = window.setTimeout(() => {
      setOpenFlyout(null);
    }, 220);
  };

  const sectionClass = (active) => `sidebar-section${active ? " active" : ""}`;
  const sectionBtnClass = (active) => `sidebar-section-btn${active ? " active" : ""}`;
  const chevronClass = (open) => `sidebar-chevron${open ? " open" : ""}`;
  const subLinkClass = (active) => `sidebar-sublink${active ? " active" : ""}`;

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <aside className={`sidebar-shell${collapsed ? " collapsed" : ""}`}>
      <div className="sidebar-top">
        <div className="sidebar-company">
          <div className="sidebar-company-icon" aria-hidden="true">
            <UserCircle className="sidebar-company-avatar" weight="fill" />
          </div>
          {!collapsed && (
            <div className="sidebar-company-text">
              <div className="sidebar-company-name">Company Name</div>
              <div className="sidebar-company-id">#ID</div>
            </div>
          )}
        </div>
      </div>

      {!collapsed ? (
        <nav className="sidebar-nav">
          <div className={sectionClass(isDispatchActive)}>
            <button
              type="button"
              className={sectionBtnClass(isDispatchActive)}
              onClick={() => setDispatchOpen((v) => !v)}
              aria-expanded={dispatchOpen}
            >
              <span className="sidebar-section-left">
                <Headset size={18} weight="fill" />
                <span>Dispatch</span>
              </span>
              <CaretDown size={16} weight="bold" className={chevronClass(dispatchOpen)} />
            </button>

            {dispatchOpen && (
              <div className="sidebar-sublist">
                <Link className={subLinkClass(pathname === "/dashboard/orders")} href="/dashboard/orders">
                  <Package size={18} weight="fill" />
                  <span>Orders</span>
                </Link>
                <Link className={subLinkClass(pathname === "/dashboard/customers")} href="/dashboard/customers">
                  <Users size={18} weight="fill" />
                  <span>Customers</span>
                </Link>
              </div>
            )}
          </div>

          <div className={sectionClass(isFleetActive)}>
            <button
              type="button"
              className={sectionBtnClass(isFleetActive)}
              onClick={() => setFleetOpen((v) => !v)}
              aria-expanded={fleetOpen}
            >
              <span className="sidebar-section-left">
                <Garage size={18} weight="fill" />
                <span>Fleet</span>
              </span>
              <CaretDown size={16} weight="bold" className={chevronClass(fleetOpen)} />
            </button>

            {fleetOpen && (
              <div className="sidebar-sublist">
                <Link className={subLinkClass(pathname === "/dashboard/trucks")} href="/dashboard/trucks">
                  <Truck size={18} weight="fill" />
                  <span>Trucks</span>
                </Link>
                <Link className={subLinkClass(pathname === "/dashboard/trailers")} href="/dashboard/trailers">
                  <TruckTrailer size={18} weight="fill" />
                  <span>Trailers</span>
                </Link>
                <Link className={subLinkClass(pathname === "/dashboard/drivers")} href="/dashboard/drivers">
                  <Seatbelt size={18} weight="fill" />
                  <span>Drivers</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      ) : (
        <nav className="sidebar-iconnav" aria-label="Sidebar">
          <div
            className="sidebar-flyout-item"
            onMouseEnter={() => openFlyoutFor("dispatch")}
            onMouseLeave={scheduleCloseFlyout}
          >
            <Link
              className={`sidebar-iconlink${isDispatchActive ? " active" : ""}`}
              href="/dashboard/orders"
              aria-label="Dispatch"
            >
              <Headset size={18} weight="fill" />
            </Link>
            <div className="sidebar-icon-tooltip" role="tooltip">Dispatch</div>

            <div
              className={`sidebar-flyout${openFlyout === "dispatch" ? " open" : ""}`}
              role="menu"
              aria-label="Dispatch"
              onMouseEnter={() => openFlyoutFor("dispatch")}
              onMouseLeave={scheduleCloseFlyout}
            >
              <div className="sidebar-flyout-links">
                <Link className={`sidebar-flyout-link${pathname === "/dashboard/orders" ? " active" : ""}`} href="/dashboard/orders">
                  <Package size={18} weight="fill" />
                  <span>Orders</span>
                </Link>
                <Link className={`sidebar-flyout-link${pathname === "/dashboard/customers" ? " active" : ""}`} href="/dashboard/customers">
                  <Users size={18} weight="fill" />
                  <span>Customers</span>
                </Link>
              </div>
            </div>
          </div>

          <div
            className="sidebar-flyout-item"
            onMouseEnter={() => openFlyoutFor("fleet")}
            onMouseLeave={scheduleCloseFlyout}
          >
            <Link
              className={`sidebar-iconlink${isFleetActive ? " active" : ""}`}
              href="/dashboard/trucks"
              aria-label="Fleet"
            >
              <Garage size={18} weight="fill" />
            </Link>
            <div className="sidebar-icon-tooltip" role="tooltip">Fleet</div>

            <div
              className={`sidebar-flyout${openFlyout === "fleet" ? " open" : ""}`}
              role="menu"
              aria-label="Fleet"
              onMouseEnter={() => openFlyoutFor("fleet")}
              onMouseLeave={scheduleCloseFlyout}
            >
              <div className="sidebar-flyout-links">
                <Link className={`sidebar-flyout-link${pathname === "/dashboard/trucks" ? " active" : ""}`} href="/dashboard/trucks">
                  <Truck size={18} weight="fill" />
                  <span>Trucks</span>
                </Link>
                <Link className={`sidebar-flyout-link${pathname === "/dashboard/trailers" ? " active" : ""}`} href="/dashboard/trailers">
                  <TruckTrailer size={18} weight="fill" />
                  <span>Trailers</span>
                </Link>
                <Link className={`sidebar-flyout-link${pathname === "/dashboard/drivers" ? " active" : ""}`} href="/dashboard/drivers">
                  <Seatbelt size={18} weight="fill" />
                  <span>Drivers</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      <div className="sidebar-bottom">
        <div className="sidebar-bottom-actions">
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className="sidebar-collapse-icon" aria-hidden="true">
              {collapsed ? (
                <svg viewBox="0 -960 960 960" width="20" height="20" aria-hidden="true" focusable="false">
                  <path
                    fill="currentColor"
                    d="M500-592v224q0 14 12 19t22-5l98-98q12-12 12-28t-12-28l-98-98q-10-10-22-5t-12 19ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm200-80h360v-560H400v560Z"
                  />
                </svg>
              ) : (
                <svg viewBox="0 -960 960 960" width="20" height="20" aria-hidden="true" focusable="false">
                  <path
                    fill="currentColor"
                    d="M660-368v-224q0-14-12-19t-22 5l-98 98q-12 12-12 28t12 28l98 98q10 10 22 5t12-19ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm200-80h360v-560H400v560Z"
                  />
                </svg>
              )}
            </span>
            {!collapsed && <span className="sidebar-collapse-label">Collapse Sidebar</span>}
          </button>

          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <span className="sidebar-collapse-icon" aria-hidden="true">
              <svg viewBox="0 -960 960 960" width="20" height="20" aria-hidden="true" focusable="false">
                <path
                  fill="currentColor"
                  d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240q17 0 28.5 11.5T480-800q0 17-11.5 28.5T440-760H200v560h240q17 0 28.5 11.5T480-160q0 17-11.5 28.5T440-120H200Zm487-320H400q-17 0-28.5-11.5T360-480q0-17 11.5-28.5T400-520h287l-75-75q-11-11-11-27t11-28q11-12 28-12.5t29 11.5l143 143q12 12 12 28t-12 28L669-309q-12 12-28.5 11.5T612-310q-11-12-10.5-28.5T613-366l74-74Z"
                />
              </svg>
            </span>
            {!collapsed && <span className="sidebar-collapse-label">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
