"use client";

import { useState } from "react";
import { useOverlay } from "@/hooks/useOverlay";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PhoneInput from "@/components/PhoneInput";
import { apiFetch } from "@/lib/fetcher";
import PortalSelect from "@/components/PortalSelect";

function makeDriverId() {
  const n = Date.now() % 10000;
  return `DR-${String(n).padStart(4, "0")}`;
}

export default function NewDriverForm() {
  const { closeOverlay, data } = useOverlay();

  const trucks = data?.trucks || [];
  const afterSave = data?.afterSave;

  const initial = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    truckId: "",
  };

  const [form, setForm] = useState(initial);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const clearAll = () => setForm(initial);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      password: form.password,
    };

    const created = await apiFetch("/users", { method: "POST", body: payload });
    const createdUserId = created?.user?._id || created?.user?.id;

    if (form.truckId && createdUserId) {
      await apiFetch(`/trucks/${form.truckId}`, { method: "PUT", body: { driver: createdUserId } });
    }

    await afterSave?.();
    closeOverlay();
  };

  return (
    <form onSubmit={handleSubmit} className="overlay-form">
      <div className="overlay-topbar">
        <div className="overlay-title">ADD DRIVER</div>
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
        <div className="overlay-section">
          <div className="overlay-section-title">1. General</div>

          <div className="overlay-field">
            <label>First name</label>
            <input
              className="overlay-input"
              placeholder="Enter first name"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
            />
          </div>

          <div className="overlay-field">
            <label>Last name</label>
            <input
              className="overlay-input"
              placeholder="Enter last name"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
          </div>

          <div className="overlay-field">
            <label>Driver Phone</label>
            <PhoneInput value={form.phone} onChange={(v) => update("phone", v)} />
          </div>

          <div className="overlay-field">
            <label>Driver E-mail</label>
            <input
              className="overlay-input"
              placeholder="planning@customer.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>

          <div className="overlay-field">
            <label>Password</label>
            <input
              className="overlay-input"
              placeholder="Enter password"
              type="text"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="overlay-section">
          <div className="overlay-section-title">2. Optional</div>

          <div className="overlay-field">
            <label>Truck</label>
            <PortalSelect
              value={form.truckId}
              onChange={(v) => update("truckId", v)}
              options={[
                { value: "", label: "None" },
                ...trucks.map((t) => ({ value: t.id, label: t.name })),
              ]}
              placeholder="None"
              triggerClassName="overlay-input overlay-select-trigger"
            />
          </div>
        </div>
      </div>

      <div className="overlay-footer">
        <button type="button" className="btn-outline" onClick={closeOverlay}>
          Cancel
        </button>
        <button type="submit" className="btn-primary overlay-primary">
          Create
        </button>
      </div>
    </form>
  );
}
