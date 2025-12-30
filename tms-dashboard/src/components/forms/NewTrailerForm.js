"use client";

import { useMemo, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useOverlay } from "@/hooks/useOverlay";
import { apiFetch } from "@/lib/fetcher";
import TextInput from "@/components/TextInput";
import SelectInput from "@/components/SelectInput";

const TRAILER_TYPE_OPTIONS = [
  { value: "Dry Van", label: "Dry Van" },
  { value: "Reefer", label: "Reefer" },
  { value: "Flatbed", label: "Flatbed" },
  { value: "Step Deck", label: "Step Deck" },
  { value: "Tanker", label: "Tanker" },
  { value: "Lowboy", label: "Lowboy" },
  { value: "Curtainside", label: "Curtainside" },
  { value: "Hopper-Bottom", label: "Hopper-Bottom" },
];

function normalizeLicensePlate(v) {
  return String(v || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

export default function NewTrailerForm() {
  const { closeOverlay, data } = useOverlay();

  const existing = data?.mode === "edit" ? data?.trailer : null;
  const existingId = existing?.id || existing?._id;
  const isEdit = Boolean(existingId);

  const trucks = data?.trucks || [];
  const afterSave = data?.afterSave;

  const initial = {
    licensePlate: existing?.licensePlate || "",
    trailerNumber: existing?.trailerNumber || "",
    model: existing?.model || "",
    type: existing?.type || "",
    truckId: existing?.truck?._id || existing?.truck?.id || existing?.truck || "",
  };

  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    licensePlate: "",
    trailerNumber: "",
    model: "",
    type: "",
  });

  const truckOptions = useMemo(
    () => [{ value: "", label: "None" }, ...trucks.map((t) => ({ value: t.id, label: t.name }))],
    [trucks]
  );

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field in fieldErrors) setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const clearAll = () => {
    setForm(initial);
    setFormError("");
    setFieldErrors({ licensePlate: "", trailerNumber: "", model: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const nextErrors = { licensePlate: "", trailerNumber: "", model: "", type: "" };

    const licensePlate = normalizeLicensePlate(form.licensePlate);
    const trailerNumber = String(form.trailerNumber || "").trim();
    const model = String(form.model || "").trim();
    const type = String(form.type || "").trim();

    if (!licensePlate) nextErrors.licensePlate = "Please enter a license plate.";

    if (!trailerNumber) nextErrors.trailerNumber = "Please enter a trailer number.";

    if (!model) nextErrors.model = "Please enter a model.";
    if (!type) nextErrors.type = "Please choose a type.";

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) {
      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit) {
        await apiFetch(`/trailers/${existingId}` , {
          method: "PUT",
          body: {
            licensePlate,
            trailerNumber,
            model,
            type,
            truck: form.truckId || null,
          },
        });
      } else {
        const created = await apiFetch("/trailers", {
          method: "POST",
          body: {
            licensePlate,
            trailerNumber,
            model,
            type,
            status: "active",
          },
        });

        const trailerId = created?._id || created?.id;

        // Assign truck via update route to keep both sides (truck.trailer) in sync.
        if (trailerId && form.truckId) {
          await apiFetch(`/trailers/${trailerId}` , {
            method: "PUT",
            body: { truck: form.truckId || null },
          });
        }
      }

      await afterSave?.();
      closeOverlay();
    } catch (err) {
      const message = String(err?.data?.message || err?.message || (isEdit ? "Failed to update trailer" : "Failed to create trailer"));
      const field = String(err?.data?.field || "");
      const code = String(err?.data?.code || "");

      if (field === "licensePlate" || code === "LICENSE_PLATE_IN_USE" || /license plate.*in use/i.test(message)) {
        setFieldErrors((p) => ({ ...p, licensePlate: "This license plate is already in use." }));
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
        <div className="overlay-title">{isEdit ? "EDIT TRAILER" : "ADD TRAILER"}</div>
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
            <label>Trailer Number</label>
            <TextInput
              bare
              placeholder="Enter Trailer Number"
              value={form.trailerNumber}
              onChange={(e) => update("trailerNumber", e.target.value)}
            />
            {fieldErrors.trailerNumber ? (
              <div className="text-xs text-red-600 mt-1">{fieldErrors.trailerNumber}</div>
            ) : null}
          </div>

          <div className="overlay-field">
            <label>Model</label>
            <TextInput
              bare
              placeholder="Enter Trailer Model"
              value={form.model}
              onChange={(e) => update("model", e.target.value)}
            />
            {fieldErrors.model ? <div className="text-xs text-red-600 mt-1">{fieldErrors.model}</div> : null}
          </div>

          <div className="overlay-field">
            <label>Type</label>
            <SelectInput bare value={form.type} onChange={(e) => update("type", e.target.value)}>
              <option value="">Choose Type</option>
              {TRAILER_TYPE_OPTIONS.map((o) => (
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
            <label>Truck</label>
            <SelectInput bare value={form.truckId} onChange={(e) => update("truckId", e.target.value)}>
              {truckOptions.map((o) => (
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
