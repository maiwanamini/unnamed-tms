"use client";

import { useState } from "react";
import { useOverlay } from "@/hooks/useOverlay";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PhoneInput from "@/components/PhoneInput";

function makeDriverId() {
  const n = Date.now() % 10000;
  return `DR-${String(n).padStart(4, "0")}`;
}

export default function NewDriverForm() {
  const { closeOverlay, data } = useOverlay();

  const trucks = data?.trucks || [];
  const onCreate = data?.onCreate;

  const initial = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    truckId: "",
  };

  const [form, setForm] = useState(initial);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const clearAll = () => setForm(initial);

  const handleSubmit = (e) => {
    e.preventDefault();

    const fullName = [form.firstName, form.lastName].filter(Boolean).join(" ").trim() || "Full Name";
    const t = trucks.find((x) => x.id === form.truckId);
    const createdAt = new Date().toISOString();

    const driver = {
      id: makeDriverId(),
      fullName,
      status: "Active",
      phone: form.phone,
      email: form.email,
      age: 31,
      truckId: t?.id || "",
      truckName: t?.name || "",
      createdAt,
      avatarUrl: "",
    };

    onCreate?.(driver);
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
        </div>

        <div className="overlay-section">
          <div className="overlay-section-title">2. Optional</div>

          <div className="overlay-field">
            <label>Truck</label>
            <select className="overlay-input" value={form.truckId} onChange={(e) => update("truckId", e.target.value)}>
              <option value="">None</option>
              {trucks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
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
