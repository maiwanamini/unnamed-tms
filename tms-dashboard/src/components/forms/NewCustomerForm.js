"use client";

import { useState } from "react";
import { useOverlay } from "@/hooks/useOverlay";
import { useCustomers } from "@/hooks/useCustomers";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PhoneInput from "@/components/PhoneInput";
import { apiFetch } from "@/lib/fetcher";

export default function NewCustomerForm() {
  const { closeOverlay } = useOverlay();
  const { mutate } = useCustomers();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const initial = {
    name: "",
    address: "",
    contactName: "",
    phone: "",
    email: "",
  };

  const [form, setForm] = useState(initial);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await apiFetch("/clients", {
        method: "POST",
        body: {
          clientName: form.name,
          clientAddress: form.address,
          contactName: form.contactName,
          contactPhone: form.phone,
          contactEmail: form.email,
        },
      });

      await mutate();
      closeOverlay();
    } catch (e) {
      setError(e?.message || "Failed to create customer");
    } finally {
      setSubmitting(false);
    }
  };

  const clearAll = () => setForm(initial);

  return (
    <form onSubmit={handleSubmit} className="overlay-form">
      <div className="overlay-topbar">
        <div className="overlay-title">ADD CUSTOMER</div>
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

          <div className="overlay-field">
            <label>Name</label>
            <input
              className="overlay-input"
              placeholder="Enter Name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          <div className="overlay-field">
            <label>Address</label>
            <input
              className="overlay-input"
              placeholder="Enter Address"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>
        </div>

        <div className="overlay-section">
          <div className="overlay-section-title">2. Contact</div>

          <div className="overlay-field">
            <label>Contact Name</label>
            <input
              className="overlay-input"
              placeholder="Enter Contact Name"
              value={form.contactName}
              onChange={(e) => update("contactName", e.target.value)}
            />
          </div>

          <div className="overlay-field">
            <label>Contact Phone</label>
            <PhoneInput value={form.phone} onChange={(v) => update("phone", v)} />
          </div>

          <div className="overlay-field">
            <label>Contact E-mail</label>
            <input
              className="overlay-input"
              placeholder="planning@customer.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
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
