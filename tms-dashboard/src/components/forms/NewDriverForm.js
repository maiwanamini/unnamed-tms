"use client";

import { useState } from "react";
import { useOverlay } from "@/hooks/useOverlay";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PhoneInput from "@/components/PhoneInput";
import { apiFetch } from "@/lib/fetcher";
import TextInput from "@/components/TextInput";
import SelectInput from "@/components/SelectInput";

function makeDriverId() {
  const n = Date.now() % 10000;
  return `DR-${String(n).padStart(4, "0")}`;
}

export default function NewDriverForm() {
  const { closeOverlay, data } = useOverlay();

  const trucks = data?.trucks || [];
  const afterSave = data?.afterSave;
  const mode = String(data?.mode || "create").toLowerCase();
  const isEdit = mode === "edit";
  const existing = data?.driver || null;
  const existingId = String(existing?.id || existing?._id || "");
  const existingTruckId = String(existing?.truckId || existing?.truck?._id || existing?.truck?.id || "");

  const initial = {
    firstName: isEdit ? String(existing?.firstName || "") : "",
    lastName: isEdit ? String(existing?.lastName || "") : "",
    phone: isEdit ? String(existing?.phone || "") : "",
    email: isEdit ? String(existing?.email || "") : "",
    password: "",
    truckId: isEdit ? existingTruckId : "",
  };

  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const isValidEmail = (v) => /^\S+@\S+\.\S+$/.test(String(v || "").trim());

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field === "firstName" || field === "lastName" || field === "email" || field === "phone" || field === "password") {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const clearAll = () => setForm(initial);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");
    setFieldErrors({ firstName: "", lastName: "", email: "", phone: "", password: "" });

    const nextErrors = { firstName: "", lastName: "", email: "", phone: "", password: "" };
    if (!String(form.firstName || "").trim()) nextErrors.firstName = "Please enter a first name.";
    if (!String(form.lastName || "").trim()) nextErrors.lastName = "Please enter a last name.";
    if (!String(form.email || "").trim()) nextErrors.email = "Please enter an email address.";
    else if (!isValidEmail(form.email)) nextErrors.email = "Please enter a valid email address.";
    if (!isEdit && !String(form.password || "").trim()) nextErrors.password = "Please enter a password.";

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) {
      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
    };

    try {
      let userId = existingId;

      if (isEdit) {
        if (!existingId) throw new Error("Missing driver id");
        await apiFetch(`/users/${existingId}`, { method: "PUT", body: payload });
      } else {
        const created = await apiFetch("/users", { method: "POST", body: { ...payload, password: form.password, status: "active" } });
        userId = created?.user?._id || created?.user?.id;
      }

      // Sync truck assignment if changed.
      const nextTruckId = String(form.truckId || "");
      if (existingTruckId && existingTruckId !== nextTruckId) {
        await apiFetch(`/trucks/${existingTruckId}`, { method: "PUT", body: { driver: null } });
      }
      if (nextTruckId && userId) {
        await apiFetch(`/trucks/${nextTruckId}`, { method: "PUT", body: { driver: userId } });
      }

      await afterSave?.();
      closeOverlay();
    } catch (e) {
      const message = String(e?.data?.message || e?.message || (isEdit ? "Failed to update driver" : "Failed to create driver"));
      const field = String(e?.data?.field || "");
      const code = String(e?.data?.code || "");

      if (field === "email" || code === "EMAIL_IN_USE" || /email already in use/i.test(message)) {
        setFieldErrors((prev) => ({ ...prev, email: "This email is already in use." }));
        return;
      }

      if (field === "phone" || code === "PHONE_IN_USE" || /phone already in use/i.test(message)) {
        setFieldErrors((prev) => ({ ...prev, phone: "This phone number is already in use." }));
        return;
      }

      // Fallback: map common backend required-field message.
      if (/firstName/i.test(message)) {
        setFieldErrors((prev) => ({ ...prev, firstName: "Please enter a first name." }));
        return;
      }
      if (/lastName/i.test(message)) {
        setFieldErrors((prev) => ({ ...prev, lastName: "Please enter a last name." }));
        return;
      }
      if (/\bemail\b/i.test(message)) {
        setFieldErrors((prev) => ({ ...prev, email: "Please enter a valid email address." }));
        return;
      }
      if (/password/i.test(message)) {
        setFieldErrors((prev) => ({ ...prev, password: "Please enter a password." }));
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
        <div className="overlay-title">{isEdit ? "EDIT DRIVER" : "ADD DRIVER"}</div>
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
            <label>First name</label>
            <TextInput
              bare
              placeholder="Enter first name"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
            />
            {fieldErrors.firstName ? <div className="text-xs text-red-600 mt-1">{fieldErrors.firstName}</div> : null}
          </div>

          <div className="overlay-field">
            <label>Last name</label>
            <TextInput
              bare
              placeholder="Enter last name"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
            {fieldErrors.lastName ? <div className="text-xs text-red-600 mt-1">{fieldErrors.lastName}</div> : null}
          </div>

          <div className="overlay-field">
            <label>Driver Phone</label>
            <PhoneInput value={form.phone} onChange={(v) => update("phone", v)} />
            {fieldErrors.phone ? <div className="text-xs text-red-600 mt-1">{fieldErrors.phone}</div> : null}
          </div>

          <div className="overlay-field">
            <label>Driver E-mail</label>
            <TextInput
              bare
              type="email"
              placeholder="Enter driver email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            {fieldErrors.email ? <div className="text-xs text-red-600 mt-1">{fieldErrors.email}</div> : null}
          </div>

          <div className="overlay-field">
            <label>Password</label>
            <TextInput
              bare
              placeholder="Enter driver password"
              type="text"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
            {fieldErrors.password ? <div className="text-xs text-red-600 mt-1">{fieldErrors.password}</div> : null}
          </div>
        </div>

        <div className="overlay-section">
          <div className="overlay-section-title">2. Optional</div>

          <div className="overlay-field">
            <label>Truck</label>
            <SelectInput bare value={form.truckId} onChange={(e) => update("truckId", e.target.value)}>
              <option value="">None</option>
              {trucks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
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
          {submitting ? "Creating…" : "Create"}
        </button>
      </div>
    </form>
  );
}
