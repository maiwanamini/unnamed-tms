"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import PersonIcon from '@mui/icons-material/Person';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RouteIcon from '@mui/icons-material/Route';
import NoteIcon from '@mui/icons-material/Note';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StatusPill from "@/components/StatusPill";
import StopCard from '@/components/StopCard';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AvatarCircle from "@/components/AvatarCircle";
import Tooltip from "@/components/Tooltip";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useOrders } from "@/hooks/useOrders";
import { useTrailers } from "@/hooks/useTrailers";
import { useTrucks } from "@/hooks/useTrucks";
import { useUsers } from "@/hooks/useUsers";
import { useOverlay } from "@/hooks/useOverlay";
import { apiFetch, fetcher } from "@/lib/fetcher";
import { prettyTrailerType, prettyTruckType } from "@/lib/vehicle";

const FALLBACK_STOPS = [
  { id: 1, type: 'pickup', title: 'Address Name', address: 'Address', ref: '#Reference', time: 'Date, Time', note: 'Notes', status: 'Completed' },
  { id: 2, type: 'dropoff', title: 'Address Name', address: 'Address', ref: '#Reference', time: 'Date, Time', note: 'Notes', status: 'Moving' },
  { id: 3, type: 'dropoff', title: 'Address Name', address: 'Address', ref: '#Reference', time: 'Date, Time', note: 'Notes', status: 'Pending' },
  { id: 4, type: 'dropoff', title: 'Address Name', address: 'Address', ref: '#Reference', time: 'Date, Time', note: 'Notes', status: 'Canceled' },
];

export default function DetailPanel({ selected, onClose }) {
  const stops = selected?.stops || FALLBACK_STOPS;

  const driverName = selected?.driver && selected.driver !== "Driver" ? String(selected.driver) : "";
  const driverPhone = selected?.driverPhone ? String(selected.driverPhone) : "";
  const driverAvatarUrl = selected?.driverAvatarUrl ? String(selected.driverAvatarUrl) : "";

  const hasTruck = Boolean(String(selected?.truck || selected?.truckPlate || "").trim());
  const hasTrailer = Boolean(String(selected?.trailer || selected?.trailerPlate || "").trim());
  const hasDriver = Boolean(String(selected?.driverId || driverName || "").trim());

  const { mutate: mutateOrders } = useOrders();
  const { openOverlay } = useOverlay();
  const { trucks, isLoading: trucksLoading } = useTrucks();
  const { trailers, isLoading: trailersLoading } = useTrailers();
  const { users, isLoading: usersLoading } = useUsers();

  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const headerMenuWrapRef = useRef(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (!headerMenuOpen) return;

    const onDoc = (e) => {
      const el = headerMenuWrapRef.current;
      if (!el) return;
      if (!el.contains(e.target)) setHeaderMenuOpen(false);
    };

    const onKey = (e) => {
      if (e.key === "Escape") setHeaderMenuOpen(false);
    };

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [headerMenuOpen, headerMenuWrapRef]);

  const cancelOrder = async () => {
    const orderId = String(selected?.dbId || "");
    if (!orderId) return;

    setCanceling(true);
    try {
      await apiFetch(`/orders/${orderId}`, { method: "PUT", body: { status: "canceled" } });
      await mutateOrders();
      setCancelConfirmOpen(false);
      setHeaderMenuOpen(false);
    } catch {
      // Keep behavior simple: if it fails, just keep dialog open.
    } finally {
      setCanceling(false);
    }
  };

  const [assignPickerOpen, setAssignPickerOpen] = useState(false);
  const [assignPickerType, setAssignPickerType] = useState(null); // "truck" | "trailer" | "driver" | null
  const [assignChoice, setAssignChoice] = useState("");
  const [assignSearch, setAssignSearch] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");

  useEffect(() => {
    if (!assignPickerOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setAssignPickerOpen(false);
        setAssignPickerType(null);
        setAssignChoice("");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [assignPickerOpen]);

  const availableTrucks = useMemo(
    () =>
      (Array.isArray(trucks) ? trucks : [])
        .filter((t) => String(t?.status || "").trim().toLowerCase() !== "inactive")
        .map((t) => {
          const plate = String(t?.licensePlate || "").trim() || String(t?.id || "").trim();
          const typeLabel = prettyTruckType(t?.type);
          return {
            id: t.id,
            plate,
            subLabel: typeLabel,
            searchText: [plate, typeLabel].filter(Boolean).join(" ").toLowerCase(),
          };
        }),
    [trucks],
  );

  const availableTrailers = useMemo(
    () =>
      (Array.isArray(trailers) ? trailers : [])
        .filter((t) => String(t?.status || "").trim().toLowerCase() !== "inactive")
        .map((t) => {
          const plate = String(t?.licensePlate || "").trim() || String(t?.id || "").trim();
          const number = String(t?.trailerNumber || "").trim();
          const typeLabel = prettyTrailerType(t?.type);
          const subLabel = [number, typeLabel].filter(Boolean).join(" ").trim();
          return {
            id: t.id,
            plate,
            subLabel,
            searchText: [plate, subLabel].filter(Boolean).join(" ").toLowerCase(),
          };
        }),
    [trailers],
  );

  const availableDrivers = useMemo(
    () =>
      (Array.isArray(users) ? users : [])
        .filter((u) => String(u?.role || "").trim() === "driver")
        .filter((u) => String(u?.status || "").trim().toLowerCase() !== "inactive")
        .map((u) => {
          const id = String(u?.id || u?._id || "").trim();
          const name = String(u?.fullName || u?.email || "").trim();
          const phone = String(u?.phone || "").trim();
          const avatarUrl = String(u?.avatarUrl || "").trim();
          const searchText = [name, phone].filter(Boolean).join(" ").toLowerCase();
          // Do not show phone numbers in the list, but keep them searchable.
          return { id, plate: name, subLabel: "", avatarUrl, searchText };
        })
        .filter((u) => u.id && u.plate),
    [users],
  );

  const assignTruck = async (truckId) => {
    const orderId = selected?.dbId;
    if (!orderId) {
      setAssignError("Cannot assign: missing order id.");
      return;
    }

    setAssignError("");
    setAssigning(true);
    try {
      await apiFetch(`/orders/${orderId}`, { method: "PUT", body: { truck: truckId } });
      await mutateOrders();
      setAssignChoice("");
      setAssignPickerOpen(false);
      setAssignPickerType(null);
    } catch (e) {
      setAssignError(e?.data?.message || e?.message || "Failed to assign truck");
    } finally {
      setAssigning(false);
    }
  };

  const unassignTruck = async () => {
    const orderId = selected?.dbId;
    if (!orderId) {
      setAssignError("Cannot unassign: missing order id.");
      return;
    }

    setAssignError("");
    setAssigning(true);
    try {
      await apiFetch(`/orders/${orderId}`, { method: "PUT", body: { truck: null } });
      await mutateOrders();
      setAssignChoice("");
      setAssignPickerOpen(false);
      setAssignPickerType(null);
    } catch (e) {
      setAssignError(e?.data?.message || e?.message || "Failed to unassign truck");
    } finally {
      setAssigning(false);
    }
  };

  const assignTrailer = async (trailerId) => {
    const orderId = selected?.dbId;
    if (!orderId) {
      setAssignError("Cannot assign: missing order id.");
      return;
    }

    setAssignError("");
    setAssigning(true);
    try {
      await apiFetch(`/orders/${orderId}`, { method: "PUT", body: { trailer: trailerId } });
      await mutateOrders();
      setAssignChoice("");
      setAssignPickerOpen(false);
      setAssignPickerType(null);
    } catch (e) {
      setAssignError(e?.data?.message || e?.message || "Failed to assign trailer");
    } finally {
      setAssigning(false);
    }
  };

  const unassignTrailer = async () => {
    const orderId = selected?.dbId;
    if (!orderId) {
      setAssignError("Cannot unassign: missing order id.");
      return;
    }

    setAssignError("");
    setAssigning(true);
    try {
      await apiFetch(`/orders/${orderId}`, { method: "PUT", body: { trailer: null } });
      await mutateOrders();
      setAssignChoice("");
      setAssignPickerOpen(false);
      setAssignPickerType(null);
    } catch (e) {
      setAssignError(e?.data?.message || e?.message || "Failed to unassign trailer");
    } finally {
      setAssigning(false);
    }
  };

  const assignDriver = async (driverId) => {
    const orderId = selected?.dbId;
    if (!orderId) {
      setAssignError("Cannot assign: missing order id.");
      return;
    }

    setAssignError("");
    setAssigning(true);
    try {
      await apiFetch(`/orders/${orderId}`, { method: "PUT", body: { driver: driverId } });
      await mutateOrders();
      setAssignChoice("");
      setAssignPickerOpen(false);
      setAssignPickerType(null);
    } catch (e) {
      setAssignError(e?.data?.message || e?.message || "Failed to assign driver");
    } finally {
      setAssigning(false);
    }
  };

  const unassignDriver = async () => {
    const orderId = selected?.dbId;
    if (!orderId) {
      setAssignError("Cannot unassign: missing order id.");
      return;
    }

    setAssignError("");
    setAssigning(true);
    try {
      await apiFetch(`/orders/${orderId}`, { method: "PUT", body: { driver: null } });
      await mutateOrders();
      setAssignChoice("");
      setAssignPickerOpen(false);
      setAssignPickerType(null);
    } catch (e) {
      setAssignError(e?.data?.message || e?.message || "Failed to unassign driver");
    } finally {
      setAssigning(false);
    }
  };

  const openAssignPicker = (type) => {
    setAssignError("");
    setAssignPickerType(type);
    if (type === "truck") setAssignChoice(String(selected?.truckId || ""));
    else if (type === "trailer") setAssignChoice(String(selected?.trailerId || ""));
    else if (type === "driver") setAssignChoice(String(selected?.driverId || ""));
    else setAssignChoice("");
    setAssignSearch("");
    setAssignPickerOpen(true);
  };

  const closeAssignPicker = () => {
    setAssignPickerOpen(false);
    setAssignPickerType(null);
    setAssignChoice("");
    setAssignSearch("");
  };

  const pickerItems = assignPickerType === "truck" ? availableTrucks : assignPickerType === "trailer" ? availableTrailers : availableDrivers;
  const pickerLoading = assignPickerType === "truck" ? trucksLoading : assignPickerType === "trailer" ? trailersLoading : usersLoading;

  const renderAssignPicker = (type) => {
    if (!assignPickerOpen || assignPickerType !== type) return null;
    const title = type === "truck" ? "Trucks" : type === "trailer" ? "Trailers" : "Drivers";
    const items = type === "truck" ? availableTrucks : type === "trailer" ? availableTrailers : availableDrivers;
    const loading = type === "truck" ? trucksLoading : type === "trailer" ? trailersLoading : usersLoading;

    const q = String(assignSearch || "").trim().toLowerCase();
    const filteredItems = q ? items.filter((it) => String(it?.searchText || "").includes(q)) : items;

    return (
      <div style={{ marginTop: 10, border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#ffffff" }}>
        <div
          style={{
            padding: 10,
            background: "#f9fafb",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div
            style={{
              flex: "1 1 0%",
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "7px 10px",
            }}
          >
            <SearchIcon style={{ fontSize: 18, color: "#94a3b8" }} />
            <input
              className="filter-input"
              aria-label={`Search ${title}`}
              placeholder={`Search ${title.toLowerCase()}`}
              value={assignSearch}
              onChange={(e) => setAssignSearch(e.target.value)}
              style={{
                width: "100%",
                minWidth: 0,
                background: "transparent",
                border: 0,
                padding: 0,
                outline: "none",
              }}
            />
          </div>
          <button
            type="button"
            className="small-ghost assign-picker-close"
            aria-label="Close"
            onClick={closeAssignPicker}
            disabled={assigning}
            style={{ flex: "0 0 40px" }}
          >
            <CloseIcon />
          </button>
        </div>

        <div style={{ maxHeight: 260, overflowY: "auto", padding: "0 10px" }}>
          {loading ? (
            <div style={{ padding: 12, color: "#6b7280" }}>Loading…</div>
          ) : filteredItems.length ? (
            filteredItems.map((item) => {
              const selectedRow = String(assignChoice) === String(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAssignChoice(String(item.id))}
                  className={`assign-picker-row${selectedRow ? " is-selected" : ""}`}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: 12,
                    border: 0,
                    borderBottom: "none",
                    background: selectedRow ? "#e6f3ff" : undefined,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 10,
                  }}
                >
                  {type === "driver" ? (
                    <AvatarCircle src={String(item.avatarUrl || "")} name={String(item.plate || "")} seed={String(item.id || item.plate || "")} size={28} />
                  ) : null}
                  <span
                    style={{
                      fontWeight: selectedRow ? 600 : 400,
                      color: "#111827",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      minWidth: 0,
                    }}
                  >
                    {item.subLabel ? `${item.plate} - ${item.subLabel}` : item.plate}
                  </span>
                </button>
              );
            })
          ) : (
            <div style={{ padding: 12, color: "#6b7280" }}>{items.length ? `No matching ${title.toLowerCase()}.` : `No available ${type}s.`}</div>
          )}
        </div>

        {assignError ? <div style={{ padding: "10px 12px", color: "#dc2626", fontSize: 12 }}>{assignError}</div> : null}

        <div style={{ padding: 12, display: "flex", gap: 10, borderTop: "1px solid #eef2f6" }}>
          <button type="button" className="btn-outline" onClick={closeAssignPicker} disabled={assigning}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              if (!assignChoice) return;
              if (type === "truck") assignTruck(assignChoice);
              else if (type === "trailer") assignTrailer(assignChoice);
              else assignDriver(assignChoice);
            }}
            disabled={assigning || !assignChoice}
          >
            Assign
          </button>
        </div>
      </div>
    );
  };

  const formatKm = (km) => {
    if (!Number.isFinite(km)) return "";
    if (km < 1) return `${Math.max(0.1, Math.round(km * 10) / 10)}km`;
    return `${Math.round(km * 10) / 10}km`;
  };

  const haversineKm = (aLat, aLng, bLat, bLng) => {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const sa = Math.sin(dLat / 2);
    const sb = Math.sin(dLng / 2);
    const aa = sa * sa + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * sb * sb;
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
  };

  const routeCoords = useMemo(() => {
    const list = Array.isArray(stops) ? stops : [];
    if (list.length < 2) return null;
    const first = list[0];
    const last = list[list.length - 1];
    const fromLat = first?.geo?.lat;
    const fromLng = first?.geo?.lng;
    const toLat = last?.geo?.lat;
    const toLng = last?.geo?.lng;
    if (![fromLat, fromLng, toLat, toLng].every((n) => typeof n === "number" && Number.isFinite(n))) return null;
    return { fromLat, fromLng, toLat, toLng };
  }, [stops]);

  const straightLineKm = useMemo(() => {
    if (!routeCoords) return null;
    return haversineKm(routeCoords.fromLat, routeCoords.fromLng, routeCoords.toLat, routeCoords.toLng);
  }, [routeCoords]);

  const directionsUrl = useMemo(() => {
    if (!routeCoords) return null;
    return `/geo/directions?fromLat=${encodeURIComponent(routeCoords.fromLat)}&fromLng=${encodeURIComponent(routeCoords.fromLng)}&toLat=${encodeURIComponent(routeCoords.toLat)}&toLng=${encodeURIComponent(routeCoords.toLng)}`;
  }, [routeCoords]);

  const { data: directionsData } = useSWR(directionsUrl, fetcher, { revalidateOnFocus: false });
  const drivingKm = Number(directionsData?.distanceKm);

  const distanceLabel = useMemo(() => {
    const km = Number.isFinite(drivingKm) ? drivingKm : Number.isFinite(straightLineKm) ? straightLineKm : null;
    return km == null ? "" : formatKm(km);
  }, [drivingKm, straightLineKm]);

  return (
    <aside className="detail-panel">
      <div className="header">
        <div>
          <h3 style={{ margin: 0, fontSize: 22 }}>{selected?.id ? String(selected.id) : null}</h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div ref={(node) => { headerMenuWrapRef.current = node; }} style={{ position: "relative", display: "inline-flex" }}>
            <button
              type="button"
              className="small-ghost close-detail"
              aria-label="Order options"
              onClick={() => setHeaderMenuOpen((v) => !v)}
            >
              <MoreVertIcon />
            </button>

            {headerMenuOpen ? (
              <div
                className="status-dropdown select-input-dropdown header-menu-dropdown"
                style={{ left: "auto", right: 0, top: "calc(100% + 8px)", minWidth: 200, maxWidth: 260, zIndex: 2000 }}
                role="menu"
              >
                <div className="status-list" style={{ gap: 4 }}>
                  <button
                    type="button"
                    className="status-item"
                    onClick={() => {
                      setHeaderMenuOpen(false);
                      const orderId = String(selected?.dbId || "");
                      if (!orderId) return;
                      openOverlay("order", { mode: "edit", orderId });
                    }}
                  >
                    <span className="filter-option-left">
                      <span className="status-btn truncate">Edit order</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="status-item"
                    onClick={() => {
                      setHeaderMenuOpen(false);
                      setCancelConfirmOpen(true);
                    }}
                  >
                    <span className="filter-option-left">
                      <span className="status-btn truncate">Cancel order</span>
                    </span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="small-ghost close-detail"
            aria-label="Close details"
            onClick={() => onClose?.()}
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={cancelConfirmOpen}
        scope="screen"
        title="Cancel order"
        message="Cancel this order? This will set the status to Canceled."
        confirmLabel={canceling ? "Canceling…" : "Cancel order"}
        confirmDisabled={canceling}
        onCancel={() => {
          if (canceling) return;
          setCancelConfirmOpen(false);
        }}
        onConfirm={cancelOrder}
      />

    <div className="detail-divider" style={{ height: 1, width: '100%', background: '#e5e7eb', marginTop: 16, marginBottom: 16 }} />

      {/* Truck */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {hasTruck ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{String(selected?.truck || selected?.truckPlate || "")}</div>
                {prettyTruckType(selected?.truckType) ? (
                  <div style={{ color: "#9ca3af", fontSize: 14 }}>{prettyTruckType(selected?.truckType)}</div>
                ) : null}
              </div>
            </div>
            <div className="plate-actions">
              <Tooltip label="Change truck" wrapperProps={{ style: { display: "inline-flex" } }}>
                <button
                  type="button"
                  className="small-ghost change-truck"
                  aria-label="Change truck"
                  onClick={() => {
                    openAssignPicker("truck");
                  }}
                  disabled={assigning}
                >
                  <SwapHorizIcon />
                </button>
              </Tooltip>
              <Tooltip label="Remove truck" wrapperProps={{ style: { display: "inline-flex" } }}>
                <button
                  type="button"
                  className="small-ghost unassign-truck"
                  aria-label="Remove truck"
                  onClick={unassignTruck}
                  disabled={assigning}
                >
                  <CloseIcon />
                </button>
              </Tooltip>
            </div>
          </div>
        ) : null}

        {!hasTruck ? (
          <button
            type="button"
            className="assign-btn"
            onClick={() => {
              openAssignPicker("truck");
            }}
          >
            ASSIGN TRUCK
          </button>
        ) : null}

        {renderAssignPicker("truck")}
      </div>

      {/* Trailer */}
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {hasTrailer ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{String(selected?.trailer || selected?.trailerPlate || "")}</div>
                {String(selected?.trailerNumber || "").trim() || prettyTrailerType(selected?.trailerType) ? (
                  <div style={{ color: "#9ca3af", fontSize: 14 }}>
                    {[String(selected?.trailerNumber || "").trim(), prettyTrailerType(selected?.trailerType)].filter(Boolean).join(" ")}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="plate-actions">
              <Tooltip label="Change trailer" wrapperProps={{ style: { display: "inline-flex" } }}>
                <button
                  type="button"
                  className="small-ghost change-trailer"
                  aria-label="Change trailer"
                  onClick={() => {
                    openAssignPicker("trailer");
                  }}
                  disabled={assigning}
                >
                  <SwapHorizIcon />
                </button>
              </Tooltip>
              <Tooltip label="Remove trailer" wrapperProps={{ style: { display: "inline-flex" } }}>
                <button
                  type="button"
                  className="small-ghost unassign-trailer"
                  aria-label="Remove trailer"
                  onClick={unassignTrailer}
                  disabled={assigning}
                >
                  <CloseIcon />
                </button>
              </Tooltip>
            </div>
          </div>
        ) : null}

        {!hasTrailer ? (
          <button
            type="button"
            className="assign-btn"
            onClick={() => {
              openAssignPicker("trailer");
            }}
          >
            ASSIGN TRAILER
          </button>
        ) : null}

        {renderAssignPicker("trailer")}
      </div>

      {/* Driver */}
      <div style={{ marginTop: 16, marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {hasDriver ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <AvatarCircle src={driverAvatarUrl} name={driverName} seed={selected?.driverId || driverName} size={44} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {driverName || "Driver"}
                </div>
                <div style={{ color: "#6b7280", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {driverPhone || ""}
                </div>
              </div>
            </div>

            <div className="plate-actions">
              <Tooltip label="Change driver" wrapperProps={{ style: { display: "inline-flex" } }}>
                <button
                  type="button"
                  className="small-ghost change-driver"
                  aria-label="Change driver"
                  onClick={() => {
                    openAssignPicker("driver");
                  }}
                  disabled={assigning}
                >
                  <SwapHorizIcon />
                </button>
              </Tooltip>
              <Tooltip label="Remove driver" wrapperProps={{ style: { display: "inline-flex" } }}>
                <button
                  type="button"
                  className="small-ghost unassign-driver"
                  aria-label="Remove driver"
                  onClick={unassignDriver}
                  disabled={assigning}
                >
                  <CloseIcon />
                </button>
              </Tooltip>
            </div>
          </div>
        ) : null}

        {!hasDriver ? (
          <button
            type="button"
            className="assign-btn"
            onClick={() => {
              openAssignPicker("driver");
            }}
          >
            ASSIGN DRIVER
          </button>
        ) : null}

        {renderAssignPicker("driver")}
      </div>

      <div className="detail-divider" style={{ height: 1, width: '100%', background: '#e5e7eb', marginTop: 16, marginBottom: 16 }} />

      <h4 style={{ marginTop: 8, marginBottom: 8 }}>Stops</h4>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div className="route-pill">
          <RouteIcon className="route-icon" />
          <span className="route-text">{distanceLabel || "—"}</span>
        </div>
        <StatusPill status={selected?.status || 'Moving'} />
      </div>

      <div>
        {stops.map((s, idx) => (
          <div key={s.id}>
            <StopCard stop={s} index={idx + 1} />
            {idx < stops.length - 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '12px 0' }}>
                <ArrowDownwardIcon style={{ fontSize: 20, color: '#9ca3af' }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
