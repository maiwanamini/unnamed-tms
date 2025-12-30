"use client";

import { useEffect, useMemo, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useOverlay } from "@/hooks/useOverlay";
import { apiFetch } from "@/lib/fetcher";
import TextInput from "@/components/TextInput";
import SelectInput from "@/components/SelectInput";

const TRUCK_TYPE_OPTIONS = [
  { value: "Tractor unit", label: "Tractor unit" },
  { value: "Rigid / box truck", label: "Rigid / box truck" },
  { value: "Refrigerated (reefer) truck", label: "Refrigerated (reefer) truck" },
  { value: "Flatbed truck", label: "Flatbed truck" },
  { value: "Tanker truck", label: "Tanker truck" },
  { value: "Tip truck / dumper", label: "Tip truck / dumper" },
  { value: "Van (light commercial)", label: "Van (light commercial)" },
];

function normalizeVin(v) {
  return String(v || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function normalizeLicensePlate(v) {
  return String(v || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function isValidVinFormat(vin) {
  // VIN is 17 chars, excludes I/O/Q.
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
}

export default function NewTruckForm() {
  const { closeOverlay, data } = useOverlay();

  const existing = data?.mode === "edit" ? data?.truck : null;
  const existingId = existing?.id || existing?._id;
  const isEdit = Boolean(existingId);

  const drivers = data?.drivers || [];
  const trailers = data?.trailers || [];
  const afterSave = data?.afterSave;

  const initial = {
    licensePlate: existing?.licensePlate || "",
    vin: existing?.vin || "",
    year: existing?.year != null ? String(existing.year) : "",
    model: existing?.model || "",
    type: existing?.type || "",
    driverId: existing?.driver?._id || existing?.driver?.id || existing?.driver || "",
    trailerId: existing?.trailer?._id || existing?.trailer?.id || existing?.trailer || "",
  };

  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [decodingVin, setDecodingVin] = useState(false);
  const [vinHint, setVinHint] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    licensePlate: "",
    vin: "",
    year: "",
    model: "",
    type: "",
  });

  // Auto-fill Model Year / Model / Type from VIN when a valid 17-char VIN is provided.
  useEffect(() => {
    const vin = normalizeVin(form.vin);
    if (!vin || vin.length !== 17) return;
    if (!isValidVinFormat(vin)) return;

    let cancelled = false;

    (async () => {
      try {
        setDecodingVin(true);
        setVinHint("");
        const decoded = await apiFetch(`/vin/decode?vin=${encodeURIComponent(vin)}`);
        if (cancelled) return;

        const hasAny = Boolean(decoded?.year || decoded?.model || decoded?.type);
        if (!hasAny) {
          setVinHint("Could not auto-fill from this VIN. Please enter details manually.");
          return;
        }

        setForm((prev) => {
          const next = { ...prev };
          if (!String(prev.year || "").trim() && decoded?.year) next.year = String(decoded.year);
          if (!String(prev.model || "").trim() && decoded?.model) next.model = String(decoded.model);
          if (!String(prev.type || "").trim() && decoded?.type) next.type = String(decoded.type);
          return next;
        });
      } catch (err) {
        const status = err?.status;
        if (status === 404) {
          setVinHint("VIN not found. Please enter details manually.");
        } else {
          setVinHint("VIN auto-fill is unavailable right now. Please enter details manually.");
        }
      } finally {
        if (!cancelled) setDecodingVin(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [form.vin]);

  const driverOptions = useMemo(
    () => [{ value: "", label: "None" }, ...drivers.map((d) => ({ value: d.id, label: d.name }))],
    [drivers]
  );

  const trailerOptions = useMemo(
    () => [{ value: "", label: "None" }, ...trailers.map((t) => ({ value: t.id, label: t.name }))],
    [trailers]
  );

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const clearAll = () => {
    setForm(initial);
    setFormError("");
    setFieldErrors({ licensePlate: "", vin: "", year: "", model: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");

    const nextErrors = { licensePlate: "", vin: "", year: "", model: "", type: "" };

    const licensePlate = normalizeLicensePlate(form.licensePlate);
    if (!licensePlate) nextErrors.licensePlate = "Please enter a license plate.";

    const vin = normalizeVin(form.vin);
    const yearRaw = String(form.year || "").trim();
    const model = String(form.model || "").trim();
    const type = String(form.type || "").trim();

    if (vin) {
      if (vin.length !== 17) nextErrors.vin = "VIN must be 17 characters.";
    } else {
      const yearNum = Number(yearRaw);
      if (!yearRaw) nextErrors.year = "Please enter a model year.";
      else if (!Number.isInteger(yearNum) || yearRaw.length !== 4) nextErrors.year = "Please enter a valid year (YYYY).";

      if (!model) nextErrors.model = "Please enter a model.";
      if (!type) nextErrors.type = "Please choose a type.";
    }

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) {
      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      const yearNum = yearRaw ? Number(yearRaw) : null;

      const payload = {
        licensePlate,
        vin: vin || undefined,
        // Even when VIN is provided, persist any auto-filled (or manually entered) details.
        year: Number.isFinite(yearNum) && yearRaw.length === 4 ? yearNum : undefined,
        model: model || undefined,
        type: type || undefined,
      };

      if (isEdit) {
        await apiFetch(`/trucks/${existingId}` , {
          method: "PUT",
          body: {
            ...payload,
            driver: form.driverId || null,
            trailer: form.trailerId || null,
          },
        });
      } else {
        const created = await apiFetch("/trucks", { method: "POST", body: { ...payload, status: "active" } });
        const truckId = created?._id || created?.id;

        // Sync relationships via update route (ensures driver.truck / trailer.truck are updated).
        if (truckId && (form.driverId || form.trailerId)) {
          await apiFetch(`/trucks/${truckId}` , {
            method: "PUT",
            body: {
              driver: form.driverId || null,
              trailer: form.trailerId || null,
            },
          });
        }
      }

      await afterSave?.();
      closeOverlay();
    } catch (err) {
      const message = String(err?.data?.message || err?.message || (isEdit ? "Failed to update truck" : "Failed to create truck"));
      const field = String(err?.data?.field || "");
      const code = String(err?.data?.code || "");
      const vinProvided = Boolean(normalizeVin(form.vin));

      if (field === "licensePlate" || code === "LICENSE_PLATE_IN_USE" || /license plate.*in use/i.test(message)) {
        setFieldErrors((p) => ({ ...p, licensePlate: "This license plate is already in use." }));
        return;
      }

      if (vinProvided && (field === "vin" || code === "VIN_IN_USE" || /vin.*in use/i.test(message))) {
        setFieldErrors((p) => ({ ...p, vin: "This VIN is already in use." }));
        return;
      }

      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="overlay-form">
      <div className="overlay-topbar">
        <div className="overlay-title">{isEdit ? "EDIT TRUCK" : "ADD TRUCK"}</div>
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
        {formError ? (
          <div className="text-sm text-red-600" role="alert" style={{ padding: "0 16px" }}>
            {formError}
          </div>
        ) : null}

        <div className="overlay-section">
          <div className="overlay-section-title">1. General</div>

          <div className="overlay-field">
            <label>License Plate</label>
            <TextInput
              bare
              placeholder="XXXXXXX"
              value={form.licensePlate}
              onChange={(e) => update("licensePlate", normalizeLicensePlate(e.target.value))}
            />
            {fieldErrors.licensePlate ? <div className="text-xs text-red-600 mt-1">{fieldErrors.licensePlate}</div> : null}
          </div>

          <div className="overlay-field">
            <label>VIN (17 characters)</label>
            <TextInput
              bare
              placeholder="XXXXXXXXXXXXXXXXX"
              value={form.vin}
              onChange={(e) => update("vin", e.target.value)}
            />
            {fieldErrors.vin ? <div className="text-xs text-red-600 mt-1">{fieldErrors.vin}</div> : null}
            {decodingVin ? <div className="text-xs text-slate-500 mt-1">Auto-filling from VIN…</div> : null}
            {!decodingVin && vinHint ? <div className="text-xs text-slate-500 mt-1">{vinHint}</div> : null}
          </div>

          <div className="overlay-field">
            <label>Model Year</label>
            <TextInput
              bare
              placeholder="YYYY"
              inputMode="numeric"
              value={form.year}
              onChange={(e) => update("year", e.target.value)}
            />
            {fieldErrors.year ? <div className="text-xs text-red-600 mt-1">{fieldErrors.year}</div> : null}
          </div>

          <div className="overlay-field">
            <label>Model</label>
            <TextInput
              bare
              placeholder="Enter Truck Model"
              value={form.model}
              onChange={(e) => update("model", e.target.value)}
            />
            {fieldErrors.model ? <div className="text-xs text-red-600 mt-1">{fieldErrors.model}</div> : null}
          </div>

          <div className="overlay-field">
            <label>Type</label>
            <SelectInput bare value={form.type} onChange={(e) => update("type", e.target.value)}>
              <option value="">Choose Type</option>
              {TRUCK_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectInput>
            {fieldErrors.type ? <div className="text-xs text-red-600 mt-1">{fieldErrors.type}</div> : null}
          </div>
        </div>

        <div className="overlay-section">
          <div className="overlay-section-title">2. Optional</div>

          <div className="overlay-field">
            <label>Driver</label>
            <SelectInput bare value={form.driverId} onChange={(e) => update("driverId", e.target.value)}>
              {driverOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectInput>
          </div>

          <div className="overlay-field">
            <label>Trailer</label>
            <SelectInput bare value={form.trailerId} onChange={(e) => update("trailerId", e.target.value)}>
              {trailerOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectInput>
          </div>
        </div>
      </div>

      <div className="overlay-footer">
        <button type="button" className="btn-outline" onClick={closeOverlay}>
          Cancel
        </button>
        <button type="submit" className="btn-primary overlay-primary" disabled={submitting}>
          {submitting ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save" : "Create"}
        </button>
      </div>
    </form>
  );
}
