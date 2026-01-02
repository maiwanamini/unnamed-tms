"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CloseIcon from "@mui/icons-material/Close";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useOverlay } from "@/hooks/useOverlay";
import { useCustomers } from "@/hooks/useCustomers";
import { useOrders } from "@/hooks/useOrders";
import { useTrucks } from "@/hooks/useTrucks";
import { useTrailers } from "@/hooks/useTrailers";
import { useUsers } from "@/hooks/useUsers";
import { apiFetch } from "@/lib/fetcher";
import { formatTrailerLabel, formatTruckLabel } from "@/lib/vehicle";
import Tooltip from "@/components/Tooltip";
import TextInput from "@/components/TextInput";
import SelectInput from "@/components/SelectInput";
import AddressAutocompleteInput from "@/components/AddressAutocompleteInput";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function startOfMonthLocal(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonthsLocal(date, deltaMonths) {
  return new Date(date.getFullYear(), date.getMonth() + deltaMonths, 1);
}

function buildMonthGridLocal(monthStart) {
  const first = startOfMonthLocal(monthStart);
  const firstDow = (first.getDay() + 6) % 7; // Monday=0 ... Sunday=6
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDow; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(first.getFullYear(), first.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function monthLabelLocal(date) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function isSameDayLocal(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function parseDateTimeLocalString(v) {
  const s = String(v || "");
  if (!s || !s.includes("T")) return null;
  const [d, t] = s.split("T");
  if (!d || !t) return null;
  const [yyyy, mm, dd] = d.split("-").map((x) => Number(x));
  const [hh, min] = t.split(":").map((x) => Number(x));
  if (!yyyy || !mm || !dd) return null;
  const date = new Date(yyyy, (mm || 1) - 1, dd);
  return {
    date,
    hour: Number.isFinite(hh) ? hh : 0,
    minute: Number.isFinite(min) ? min : 0,
  };
}

function toDateTimeLocalString(date, hour, minute) {
  if (!date) return "";
  const yyyy = date.getFullYear();
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const hh = pad2(Number.isFinite(hour) ? hour : 0);
  const mi = pad2(Number.isFinite(minute) ? minute : 0);
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function todayDateTimeLocalString() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return toDateTimeLocalString(today, 0, 0);
}

function isoToDateTimeLocalString(v) {
  const d = v ? new Date(v) : null;
  if (!d || Number.isNaN(d.getTime())) return todayDateTimeLocalString();
  return toDateTimeLocalString(d, d.getHours(), d.getMinutes());
}

function formatDateTimeLocalForDisplay(v) {
  const parsed = parseDateTimeLocalString(v);
  if (!parsed?.date) return "";
  const dd = pad2(parsed.date.getDate());
  const mm = pad2(parsed.date.getMonth() + 1);
  const yyyy = parsed.date.getFullYear();
  const hh = pad2(parsed.hour ?? 0);
  const mi = pad2(parsed.minute ?? 0);
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

function makeStop(type = "pickup") {
  return {
    key: `s-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type, // pickup | delivery
    address: "",
    city: "",
    region: "",
    postalCode: "",
    geo: { lat: null, lng: null, mapboxId: null },
    locationName: "",
    reference: "",
    plannedTime: todayDateTimeLocalString(), // datetime-local string
    note: "",
  };
}

export default function NewOrderForm({ mode = "create", orderId } = {}) {
  const { closeOverlay } = useOverlay();
  const { customers, isLoading: customersLoading } = useCustomers();
  const { trucks, isLoading: trucksLoading, mutate: mutateTrucks } = useTrucks();
  const { trailers, isLoading: trailersLoading, mutate: mutateTrailers } = useTrailers();
  const { users, isLoading: usersLoading, mutate: mutateUsers } = useUsers();
  const { mutate: mutateOrders } = useOrders();

  const isEdit = String(mode || "").toLowerCase() === "edit" && Boolean(String(orderId || "").trim());

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ customerId: "", stopByKey: {} });

  const [loadingExisting, setLoadingExisting] = useState(false);
  const [existingStatus, setExistingStatus] = useState("");
  const [existingCustomerName, setExistingCustomerName] = useState("");

  const [touched, setTouched] = useState({ truck: false, driver: false, trailer: false });

  const [form, setForm] = useState({
    customerId: "",
    reference: "",
    truckId: "",
    trailerId: "",
    driverId: "",
  });

  const [stops, setStops] = useState([makeStop("pickup"), makeStop("delivery")]);

  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;
    setLoadingExisting(true);
    setError("");

    apiFetch(`/orders/${orderId}`)
      .then((order) => {
        if (cancelled) return;

        setExistingStatus(String(order?.status || ""));
        setExistingCustomerName(String(order?.customerName || ""));

        const truckId = String(order?.truck?._id || order?.truck?.id || order?.truck || "");
        const trailerId = String(order?.trailer?._id || order?.trailer?.id || order?.trailer || "");
        const driverId = String(order?.driver?._id || order?.driver?.id || order?.driver || "");

        setForm((prev) => ({
          ...prev,
          customerId: "", // resolved after customers load
          reference: String(order?.reference || ""),
          truckId,
          trailerId,
          driverId,
        }));

        const list = Array.isArray(order?.stops) ? [...order.stops] : [];
        list.sort((a, b) => (Number(a?.orderIndex) || 0) - (Number(b?.orderIndex) || 0));

        if (!list.length) {
          setStops([makeStop("pickup"), makeStop("delivery")]);
          return;
        }

        setStops(
          list.map((s) => ({
            key: `s-${String(s?._id || s?.id || "")}-${Math.random().toString(16).slice(2)}`,
            id: String(s?._id || s?.id || ""),
            type: String(s?.type || "pickup") === "pickup" ? "pickup" : "delivery",
            address: String(s?.address || ""),
            city: String(s?.city || ""),
            region: String(s?.region || ""),
            postalCode: String(s?.postalCode || ""),
            geo: {
              lat: typeof s?.geo?.lat === "number" ? s.geo.lat : null,
              lng: typeof s?.geo?.lng === "number" ? s.geo.lng : null,
              mapboxId: s?.geo?.mapboxId || null,
            },
            locationName: String(s?.locationName || ""),
            reference: String(s?.reference || ""),
            plannedTime: isoToDateTimeLocalString(s?.plannedTime),
            note: String(s?.note || ""),
          })),
        );
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.data?.message || e?.message || "Failed to load order");
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingExisting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isEdit, orderId]);

  useEffect(() => {
    if (!isEdit) return;
    if (form.customerId) return;
    const name = String(existingCustomerName || "").trim().toLowerCase();
    if (!name) return;

    const match = (Array.isArray(customers) ? customers : [])
      .find((c) => String(c?.name || "").trim().toLowerCase() === name);
    if (!match) return;
    setForm((prev) => ({ ...prev, customerId: String(match?.id || match?._id || "") }));
  }, [isEdit, customers, existingCustomerName, form.customerId]);

  const dtpWrapRef = useRef(null);
  const dtpAnchorElRef = useRef(null);
  const dtpMenuElRef = useRef(null);
  const [dtpOpenKey, setDtpOpenKey] = useState(null);
  const [dtpPos, setDtpPos] = useState({ left: 0, top: 0, minWidth: 0 });
  const [dtpDraft, setDtpDraft] = useState({ date: null, hour: 0, minute: 0, month: startOfMonthLocal(new Date()) });
  const canUseDOM = typeof window !== "undefined" && typeof document !== "undefined";

  const computeDtpPosition = useCallback(() => {
    if (!canUseDOM) return;
    const anchor = dtpAnchorElRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const viewportW = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;

    const baseMinWidth = Math.max(320, rect.width);
    const leftBase = clamp(rect.left, 8, Math.max(8, viewportW - baseMinWidth - 8));
    const gap = 8;
    const topBase = rect.bottom + gap;
    setDtpPos({ left: leftBase, top: topBase, minWidth: baseMinWidth });

    requestAnimationFrame(() => {
      const menu = dtpMenuElRef.current;
      if (!menu) return;

      const mrect = menu.getBoundingClientRect();

      // Prefer placing below; if it would overflow the viewport, place above.
      const fitsBelow = topBase + mrect.height + 8 <= viewportH;
      const topPreferred = fitsBelow ? topBase : rect.top - gap - mrect.height;
      const top = clamp(topPreferred, 8, Math.max(8, viewportH - mrect.height - 8));

      // Clamp left based on measured width.
      const left = clamp(leftBase, 8, Math.max(8, viewportW - mrect.width - 8));

      setDtpPos({ left, top, minWidth: baseMinWidth });
    });
  }, [canUseDOM]);

  useEffect(() => {
    if (!dtpOpenKey) return;

    const onDoc = (e) => {
      if (!dtpWrapRef.current) return;
      if (!dtpWrapRef.current.contains(e.target)) {
        setDtpOpenKey(null);
      }
    };

    const onKey = (e) => {
      if (e.key === "Escape") setDtpOpenKey(null);
    };

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [dtpOpenKey]);

  const openDateTimePopover = (stopKey, currentValue, anchorEl) => {
    if (!canUseDOM || !anchorEl) return;

    dtpAnchorElRef.current = anchorEl;

    const parsed = parseDateTimeLocalString(currentValue);
    const baseDate = parsed?.date || new Date();
    const rect = anchorEl.getBoundingClientRect();

    const viewportW = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
    const minWidth = Math.max(320, rect.width);
    const left = clamp(rect.left, 8, Math.max(8, viewportW - minWidth - 8));
    const gap = 8;
    const top = rect.bottom + gap;

    setDtpPos({ left, top, minWidth });
    setDtpDraft({
      date: parsed?.date || baseDate,
      hour: parsed?.hour ?? 0,
      minute: parsed?.minute ?? 0,
      month: startOfMonthLocal(baseDate),
    });
    setDtpOpenKey(stopKey);

    // Recompute after open so we can flip/clamp based on rendered size.
    requestAnimationFrame(() => computeDtpPosition());
  };

  useEffect(() => {
    if (!dtpOpenKey) return;

    const onReposition = () => computeDtpPosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [computeDtpPosition, dtpOpenKey]);

  const customerOptions = useMemo(
    () => customers.map((c) => ({ value: c.id, label: c.name || c.id })),
    [customers]
  );

  const truckOptions = useMemo(
    () =>
      trucks
        .filter((t) => String(t?.status || "").trim().toLowerCase() !== "inactive")
        .map((t) => ({ value: t.id, label: formatTruckLabel(t) || t.licensePlate || t.id })),
    [trucks]
  );

  const trailerOptions = useMemo(
    () =>
      trailers
        .filter((t) => String(t?.status || "").trim().toLowerCase() !== "inactive")
        .map((t) => ({ value: t.id, label: formatTrailerLabel(t) || t.licensePlate || t.id })),
    [trailers]
  );

  const driverOptions = useMemo(
    () =>
      users
        .filter((u) => String(u?.status || "").trim().toLowerCase() !== "inactive")
        .map((u) => ({ value: u.id, label: u.fullName || u.email || u.id })),
    [users]
  );

  const selectedCustomer = useMemo(
    () => customers.find((c) => String(c.id) === String(form.customerId)) || null,
    [customers, form.customerId]
  );

  const selectedTruck = useMemo(
    () => trucks.find((t) => String(t.id) === String(form.truckId)) || null,
    [trucks, form.truckId]
  );

  const selectedDriver = useMemo(
    () => users.find((u) => String(u.id) === String(form.driverId)) || null,
    [users, form.driverId]
  );

  const selectedTrailer = useMemo(
    () => trailers.find((t) => String(t.id) === String(form.trailerId)) || null,
    [trailers, form.trailerId]
  );

  // Auto-fill driver/trailer when a truck is selected (but allow user override).
  useEffect(() => {
    if (!selectedTruck) return;

    const next = {};

    if (!touched.driver && selectedTruck?.driver?._id) {
      next.driverId = selectedTruck.driver._id;
    }

    if (!touched.trailer && selectedTruck?.trailer?._id) {
      next.trailerId = selectedTruck.trailer._id;
    }

    if (Object.keys(next).length) {
      setForm((prev) => ({ ...prev, ...next }));
    }
  }, [selectedTruck, touched.driver, touched.trailer]);

  // Auto-fill truck when a driver with a truck is selected (but allow user override).
  useEffect(() => {
    if (!selectedDriver) return;
    const driverTruckId = selectedDriver?.truck?._id;
    if (!driverTruckId) return;
    if (touched.truck) return;

    setForm((prev) => ({ ...prev, truckId: driverTruckId }));
  }, [selectedDriver, touched.truck]);

  // Optional: if trailer is linked to a truck and the user hasn't chosen a truck, set it.
  useEffect(() => {
    if (!selectedTrailer) return;
    const trailerTruckId = selectedTrailer?.truck?._id;
    if (!trailerTruckId) return;
    if (touched.truck) return;

    setForm((prev) => ({ ...prev, truckId: trailerTruckId }));
  }, [selectedTrailer, touched.truck]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field === "customerId") {
      setFieldErrors((prev) => ({ ...prev, customerId: "" }));
    }
  };

  const setTruckId = (value, source = "user") => {
    if (source === "user") setTouched((p) => ({ ...p, truck: true }));
    setField("truckId", value);
  };

  const setDriverId = (value, source = "user") => {
    if (source === "user") setTouched((p) => ({ ...p, driver: true }));
    setField("driverId", value);
  };

  const setTrailerId = (value, source = "user") => {
    if (source === "user") setTouched((p) => ({ ...p, trailer: true }));
    setField("trailerId", value);
  };

  const clearAll = () => {
    setError("");
    setSubmitting(false);
    setFieldErrors({ customerId: "", stopByKey: {} });
    setTouched({ truck: false, driver: false, trailer: false });
    setForm({ customerId: "", reference: "", truckId: "", trailerId: "", driverId: "" });
    setStops([makeStop()]);
  };

  const updateStop = (key, patch) => {
    setStops((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));

    const stopPatch = patch || {};
    const keys = Object.keys(stopPatch);
    if (keys.includes("locationName") || keys.includes("address")) {
      setFieldErrors((prev) => {
        const current = prev.stopByKey?.[key] || {};
        const nextStop = { ...current };
        if (keys.includes("locationName")) nextStop.locationName = "";
        if (keys.includes("address")) nextStop.address = "";
        return { ...prev, stopByKey: { ...(prev.stopByKey || {}), [key]: nextStop } };
      });
    }
  };

  const moveStop = (key, delta) => {
    setStops((prev) => {
      const idx = prev.findIndex((s) => s.key === key);
      if (idx < 0) return prev;
      const nextIndex = idx + delta;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(nextIndex, 0, item);
      return copy;
    });
  };

  const removeStop = (key) => {
    setStops((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.key !== key)));
  };

  const validate = () => {
    const next = { customerId: "", stopByKey: {} };

    if (!form.customerId) {
      next.customerId = "Please select a customer.";
    }

    for (let i = 0; i < stops.length; i++) {
      const s = stops[i];
      const stopErr = { locationName: "", address: "" };
      if (!String(s.address || "").trim()) stopErr.address = "Please enter a location address.";
      if (stopErr.locationName || stopErr.address) {
        next.stopByKey[s.key] = stopErr;
      }
    }

    setFieldErrors(next);
    const hasCustomerError = Boolean(next.customerId);
    const hasStopErrors = Object.keys(next.stopByKey || {}).length > 0;
    return !(hasCustomerError || hasStopErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const ok = validate();
    if (!ok) return;

    setSubmitting(true);

    try {
      const customer = selectedCustomer;
      if (!customer) throw new Error("Customer not found");

      const effectiveOrderId = String(orderId || "").trim();

      if (isEdit && !effectiveOrderId) {
        throw new Error("Missing order id");
      }

      // If user selected a truck and changed driver/trailer, persist those links.
      if (form.truckId) {
        const truckBody = {};
        if (form.driverId) truckBody.driver = form.driverId;
        if (form.trailerId) truckBody.trailer = form.trailerId;

        if (Object.keys(truckBody).length) {
          await apiFetch(`/trucks/${form.truckId}`, { method: "PUT", body: truckBody });
          await Promise.all([mutateTrucks(), mutateTrailers(), mutateUsers()]);
        }
      }

      if (isEdit) {
        const orderBody = {
          customerName: customer.name,
          customerAddress: customer.address,
          customerPhone: customer.phone,
        };

        // Preserve status unless user explicitly changes it elsewhere.
        if (existingStatus) orderBody.status = String(existingStatus);

        if (form.reference) orderBody.reference = form.reference;
        orderBody.truck = form.truckId || null;
        orderBody.trailer = form.trailerId || null;
        orderBody.driver = form.driverId || null;

        await apiFetch(`/orders/${effectiveOrderId}`, { method: "PUT", body: orderBody });

        // Replace stops: clear order.stops, delete existing stop docs, then create the new list.
        const existingStops = await apiFetch(`/stops?order=${encodeURIComponent(effectiveOrderId)}`);
        await apiFetch(`/orders/${effectiveOrderId}`, { method: "PUT", body: { stops: [] } });

        for (const st of Array.isArray(existingStops) ? existingStops : []) {
          const sid = String(st?._id || st?.id || "");
          if (!sid) continue;
          // eslint-disable-next-line no-await-in-loop
          await apiFetch(`/stops/${sid}`, { method: "DELETE" });
        }

        for (let i = 0; i < stops.length; i++) {
          const s = stops[i];
          const plannedTime = s.plannedTime ? new Date(s.plannedTime).toISOString() : undefined;

          const geo = s?.geo && (Number.isFinite(s.geo.lat) || Number.isFinite(s.geo.lng))
            ? {
                lat: Number.isFinite(s.geo.lat) ? s.geo.lat : null,
                lng: Number.isFinite(s.geo.lng) ? s.geo.lng : null,
                mapboxId: s.geo.mapboxId || null,
              }
            : undefined;

          // eslint-disable-next-line no-await-in-loop
          await apiFetch("/stops", {
            method: "POST",
            body: {
              orderId: effectiveOrderId,
              orderIndex: i + 1,
              type: s.type,
              locationName: s.locationName,
              address: s.address,
              city: s.city,
              region: s.region,
              postalCode: s.postalCode,
              geo,
              plannedTime,
              note: s.note,
              reference: s.reference,
            },
          });
        }
      } else {
        const orderBody = {
          customerName: customer.name,
          customerAddress: customer.address,
          customerPhone: customer.phone,
          date: new Date().toISOString(),
          status: "pending",
        };

        if (form.reference) orderBody.reference = form.reference;
        if (form.truckId) orderBody.truck = form.truckId;
        if (form.trailerId) orderBody.trailer = form.trailerId;
        if (form.driverId) orderBody.driver = form.driverId;

        const created = await apiFetch("/orders", { method: "POST", body: orderBody });
        const createdId = created?._id || created?.id;
        if (!createdId) throw new Error("Order created but missing id");

        // Create stops and link them to the order.
        for (let i = 0; i < stops.length; i++) {
          const s = stops[i];
          const plannedTime = s.plannedTime ? new Date(s.plannedTime).toISOString() : undefined;

          const geo = s?.geo && (Number.isFinite(s.geo.lat) || Number.isFinite(s.geo.lng))
            ? {
                lat: Number.isFinite(s.geo.lat) ? s.geo.lat : null,
                lng: Number.isFinite(s.geo.lng) ? s.geo.lng : null,
                mapboxId: s.geo.mapboxId || null,
              }
            : undefined;

          await apiFetch("/stops", {
            method: "POST",
            body: {
              orderId: createdId,
              orderIndex: i + 1,
              type: s.type,
              locationName: s.locationName,
              address: s.address,
              city: s.city,
              region: s.region,
              postalCode: s.postalCode,
              geo,
              plannedTime,
              note: s.note,
              reference: s.reference,
            },
          });
        }
      }

      await mutateOrders();
      closeOverlay();
    } catch (err) {
      setError(err?.message || (isEdit ? "Failed to update order" : "Failed to create order"));
    } finally {
      setSubmitting(false);
    }
  };

  const loading = customersLoading || trucksLoading || trailersLoading || usersLoading || loadingExisting;

  return (
    <form onSubmit={handleSubmit} className="overlay-form">
      <div className="overlay-topbar">
        <div className="overlay-title">{isEdit ? "EDIT ORDER" : "NEW ORDER"}</div>
        <div className="overlay-actions">
          <button type="button" className="overlay-clear" onClick={clearAll}>
            <DeleteOutlineIcon style={{ fontSize: 18 }} />
            <span>CLEAR ALL</span>
          </button>
          <button type="button" className="overlay-close" onClick={closeOverlay}>
            CLOSE
          </button>
        </div>
      </div>

      <div className="overlay-body">
        {error ? (
          <div className="text-sm text-red-600" role="alert" style={{ padding: "0 16px" }}>
            {error}
          </div>
        ) : null}

        <div className="overlay-section">
          <div className="overlay-section-title">1. General</div>

          <div className="overlay-field" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label>Customer</label>
              <SelectInput
                bare
                value={form.customerId}
                onChange={(e) => setField("customerId", e.target.value)}
                disabled={loading}
              >
                <option value="">Select Customer</option>
                {customerOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </SelectInput>
              {fieldErrors.customerId ? <div className="text-xs text-red-600 mt-1">{fieldErrors.customerId}</div> : null}
            </div>

            <div>
              <label>Reference (Optional)</label>
              <TextInput
                bare
                placeholder="Reference (Optional)"
                value={form.reference}
                onChange={(e) => setField("reference", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overlay-section">
          <div className="overlay-section-title">2. Truck</div>

          <div className="overlay-field">
            <label>Truck</label>
            <SelectInput
              bare
              value={form.truckId}
              onChange={(e) => setTruckId(e.target.value, "user")}
              disabled={loading}
            >
              <option value="">Select Truck</option>
              {truckOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectInput>
          </div>

          <div className="overlay-field">
            <label>Trailer</label>
            <SelectInput
              bare
              value={form.trailerId}
              onChange={(e) => setTrailerId(e.target.value, "user")}
              disabled={loading}
            >
              <option value="">Select Trailer</option>
              {trailerOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectInput>
          </div>

          <div className="overlay-field">
            <label>Driver</label>
            <SelectInput
              bare
              value={form.driverId}
              onChange={(e) => setDriverId(e.target.value, "user")}
              disabled={loading}
            >
              <option value="">Select Driver</option>
              {driverOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectInput>
          </div>
        </div>

        <div className="overlay-section">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
            <div className="overlay-section-title" style={{ margin: "18px 0 0 0" }}>
              3. Stops
            </div>
            <button
              type="button"
              className="overlay-close add-stop-btn"
              style={{ padding: "8px 6px", marginTop: 18, display: "inline-flex", alignItems: "center", gap: 6 }}
              onClick={() => setStops((p) => [...p, makeStop("delivery")])}
            >
              <AddIcon style={{ fontSize: 18 }} />
              ADD NEW STOP
            </button>
          </div>

          {stops.map((s, idx) => (
            <div key={s.key} style={{ borderTop: "1px solid #e5e7eb", paddingTop: 12, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      background: s.type === "pickup" ? "#ecfdf5" : "#fff1f2",
                      color: s.type === "pickup" ? "#065f46" : "#9f1239",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: 0,
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 12,
                      height: 32,
                      boxSizing: "border-box",
                      width: 32,
                      minWidth: 32,
                    }}
                  >
                    {idx + 1}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      className="badge"
                      style={{
                        background: s.type === "pickup" ? "#ecfdf5" : "#fff1f2",
                        color: s.type === "pickup" ? "#065f46" : "#9f1239",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 8px",
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: 12,
                        height: 32,
                        boxSizing: "border-box",
                        margin: 0,
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        {s.type === "pickup" ? (
                          <UploadIcon style={{ fontSize: 20, color: "#065f46" }} />
                        ) : (
                          <DownloadIcon style={{ fontSize: 20, color: "#9f1239" }} />
                        )}
                        <span>{s.type === "pickup" ? "Pick up" : "Drop off"}</span>
                      </span>
                    </div>

                    <Tooltip label="Change type" wrapperProps={{ style: { display: "inline-flex" } }}>
                      <button
                        type="button"
                        className="btn-ghost stop-action-btn"
                        onClick={() => updateStop(s.key, { type: s.type === "pickup" ? "delivery" : "pickup" })}
                        aria-label="Change stop type"
                        style={{
                          width: 32,
                          height: 32,
                          padding: 0,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <SyncAltIcon style={{ fontSize: 18 }} />
                      </button>
                    </Tooltip>
                  </div>

                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <Tooltip label={idx === 0 ? "" : "Move up"} wrapperProps={{ style: { display: "inline-flex" } }}>
                    <button
                      type="button"
                      className="btn-ghost stop-action-btn"
                      onClick={() => moveStop(s.key, -1)}
                      disabled={idx === 0}
                      aria-label="Move stop up"
                      style={{ width: 32, height: 32, padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <ArrowUpwardIcon style={{ fontSize: 18 }} />
                    </button>
                  </Tooltip>
                  <Tooltip label={idx === stops.length - 1 ? "" : "Move down"} wrapperProps={{ style: { display: "inline-flex" } }}>
                    <button
                      type="button"
                      className="btn-ghost stop-action-btn"
                      onClick={() => moveStop(s.key, 1)}
                      disabled={idx === stops.length - 1}
                      aria-label="Move stop down"
                      style={{ width: 32, height: 32, padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <ArrowDownwardIcon style={{ fontSize: 18 }} />
                    </button>
                  </Tooltip>
                  <Tooltip label={stops.length <= 1 ? "" : "Remove"} wrapperProps={{ style: { display: "inline-flex" } }}>
                    <button
                      type="button"
                      className="btn-ghost stop-action-btn stop-action-danger"
                      onClick={() => removeStop(s.key)}
                      disabled={stops.length <= 1}
                      aria-label="Remove stop"
                      style={{ width: 32, height: 32, padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <CloseIcon style={{ fontSize: 18 }} />
                    </button>
                  </Tooltip>
                </div>
              </div>

              <div className="overlay-field" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label>Location Address</label>
                  <AddressAutocompleteInput
                    placeholder="Location Address"
                    value={s.address}
                    onChangeText={(next) => updateStop(s.key, { address: next, city: "", region: "", postalCode: "", geo: { lat: null, lng: null, mapboxId: null } })}
                    onSelect={(it) =>
                      updateStop(s.key, {
                        address: String(it?.label || ""),
                        city: String(it?.city || ""),
                        region: String(it?.region || ""),
                        postalCode: String(it?.postalCode || ""),
                        geo: {
                          lat: typeof it?.lat === "number" ? it.lat : null,
                          lng: typeof it?.lng === "number" ? it.lng : null,
                          mapboxId: String(it?.id || "") || null,
                        },
                      })
                    }
                  />
                  {fieldErrors.stopByKey?.[s.key]?.address ? (
                    <div className="text-xs text-red-600 mt-1">{fieldErrors.stopByKey[s.key].address}</div>
                  ) : null}
                </div>

                <div>
                  <label>Location Name (Optional)</label>
                  <TextInput
                    bare
                    placeholder="Location Name"
                    value={s.locationName}
                    onChange={(e) => updateStop(s.key, { locationName: e.target.value })}
                  />
                  {fieldErrors.stopByKey?.[s.key]?.locationName ? (
                    <div className="text-xs text-red-600 mt-1">{fieldErrors.stopByKey[s.key].locationName}</div>
                  ) : null}
                </div>
              </div>

              <div className="overlay-field" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label>Reference (Optional)</label>
                  <TextInput
                    bare
                    placeholder="Reference (Optional)"
                    value={s.reference}
                    onChange={(e) => updateStop(s.key, { reference: e.target.value })}
                  />
                </div>

                <div>
                  <label>Appointment</label>
                  <TextInput
                    bare
                    type="text"
                    placeholder="dd/mm/yyyy --:--"
                    value={formatDateTimeLocalForDisplay(s.plannedTime)}
                    readOnly
                    rightAdornment={
                      <button
                        type="button"
                        className="auth-password-toggle appointment-calendar-btn"
                        aria-label="Open calendar"
                        onMouseDown={(e) => {
                          // Prevent focus/selection quirks; open our custom calendar.
                          e.preventDefault();
                          const wrap = e.currentTarget.closest(".relative");
                          const input = wrap?.querySelector("input") || e.currentTarget;
                          openDateTimePopover(s.key, s.plannedTime, input);
                        }}
                      >
                        <CalendarMonthIcon style={{ fontSize: 18 }} />
                      </button>
                    }
                    onMouseDown={(e) => {
                      // Use our styled popover instead of the browser picker.
                      e.preventDefault();
                      openDateTimePopover(s.key, s.plannedTime, e.currentTarget);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        openDateTimePopover(s.key, s.plannedTime, e.currentTarget);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="overlay-field">
                <label>Note (Optional)</label>
                <TextInput
                  bare
                  placeholder="Notes"
                  value={s.note}
                  onChange={(e) => updateStop(s.key, { note: e.target.value })}
                />
              </div>
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, paddingTop: 12, borderTop: "1px solid #e5e7eb" }}>
            <button
              type="button"
              className="overlay-close add-stop-btn"
              style={{ padding: "8px 6px", display: "inline-flex", alignItems: "center", gap: 6 }}
              onClick={() => setStops((p) => [...p, makeStop("delivery")])}
            >
              <AddIcon style={{ fontSize: 18 }} />
              ADD NEW STOP
            </button>
          </div>

          {canUseDOM && dtpOpenKey
            ? createPortal(
                <div
                  ref={(node) => {
                    dtpWrapRef.current = node;
                    dtpMenuElRef.current = node;
                  }}
                  className="date-range-popover dtp-popover"
                  style={{
                    position: "fixed",
                    top: dtpPos.top,
                    left: dtpPos.left,
                    minWidth: dtpPos.minWidth,
                    zIndex: 100000,
                    overflowX: "hidden",
                  }}
                >
                  <div className="date-range-body">
                    <div className="drp-main" style={{ padding: 12 }}>
                      <div className="drp-months" style={{ paddingLeft: 0, paddingRight: 0, gap: 0, alignItems: "flex-start" }}>
                        <div className="drp-month" data-side="single" style={{ width: 260, marginRight: 12 }}>
                          <div className="drp-month-header">
                            <button
                              type="button"
                              className="drp-nav drp-nav-prev"
                              onClick={() => setDtpDraft((p) => ({ ...p, month: addMonthsLocal(p.month, -1) }))}
                              aria-label="Previous month"
                            >
                              <KeyboardArrowLeftIcon />
                            </button>

                            <div className="drp-month-title">{monthLabelLocal(dtpDraft.month)}</div>

                            <button
                              type="button"
                              className="drp-nav drp-nav-next"
                              onClick={() => setDtpDraft((p) => ({ ...p, month: addMonthsLocal(p.month, 1) }))}
                              aria-label="Next month"
                            >
                              <KeyboardArrowRightIcon />
                            </button>
                          </div>

                          <div className="drp-weekdays">
                            {['Mo','Tu','We','Th','Fr','Sa','Su'].map((d) => (
                              <div key={d} className="drp-weekday">{d}</div>
                            ))}
                          </div>

                          <div className="drp-grid">
                            {buildMonthGridLocal(dtpDraft.month).map((day, i) => {
                              const active = dtpDraft.date && day && isSameDayLocal(day, dtpDraft.date);
                              const today = day && isSameDayLocal(day, new Date());
                              return (
                                <button
                                  key={`${i}-${day ? day.toDateString() : 'empty'}`}
                                  type="button"
                                  className={`drp-day ${day ? '' : 'drp-empty'} ${active ? 'is-start' : ''} ${today ? 'is-today' : ''}`}
                                  onClick={() => {
                                    if (!day) return;
                                    setDtpDraft((p) => ({ ...p, date: day }));
                                  }}
                                  disabled={!day}
                                >
                                  {day ? day.getDate() : ''}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="dtp-divider" aria-hidden="true" />

                        <div className="dtp-time">
                          <div className="dtp-time-col">
                            <div className="dtp-time-list">
                              {Array.from({ length: 24 }, (_, h) => (
                                <button
                                  key={h}
                                  type="button"
                                  className={`dtp-time-item ${dtpDraft.hour === h ? 'active' : ''}`}
                                  onClick={() => setDtpDraft((p) => ({ ...p, hour: h }))}
                                >
                                  {pad2(h)}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="dtp-time-col">
                            <div className="dtp-time-list">
                              {Array.from({ length: 60 }, (_, m) => (
                                <button
                                  key={m}
                                  type="button"
                                  className={`dtp-time-item ${dtpDraft.minute === m ? 'active' : ''}`}
                                  onClick={() => setDtpDraft((p) => ({ ...p, minute: m }))}
                                >
                                  {pad2(m)}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="drp-actions" style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <button
                          type="button"
                          className="drp-btn drp-cancel"
                          onClick={() => {
                            const next = todayDateTimeLocalString();
                            setStops((prev) => prev.map((st) => (st.key === dtpOpenKey ? { ...st, plannedTime: next } : st)));
                            setDtpOpenKey(null);
                          }}
                        >
                          RESET
                        </button>

                        <div className="drp-actions-right">
                          <button type="button" className="drp-btn drp-cancel" onClick={() => setDtpOpenKey(null)}>
                            CANCEL
                          </button>
                          <button
                            type="button"
                            className="drp-btn drp-apply"
                            disabled={!dtpDraft.date}
                            onClick={() => {
                              const next = toDateTimeLocalString(dtpDraft.date, dtpDraft.hour, dtpDraft.minute);
                              setStops((prev) => prev.map((st) => (st.key === dtpOpenKey ? { ...st, plannedTime: next } : st)));
                              setDtpOpenKey(null);
                            }}
                          >
                            APPLY
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>,
                document.body
              )
            : null}
        </div>
      </div>

      <div className="overlay-footer">
        <button type="button" className="btn-outline" onClick={closeOverlay}>
          Delete Order
        </button>
        <button type="submit" className="btn-primary overlay-primary" disabled={submitting || loading}>
          {submitting ? "Submitting…" : "Submit Order"}
        </button>
      </div>
    </form>
  );
}
