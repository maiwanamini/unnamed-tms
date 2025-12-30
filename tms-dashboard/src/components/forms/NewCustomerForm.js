"use client";

import { useState } from "react";
import { useOverlay } from "@/hooks/useOverlay";
import { useCustomers } from "@/hooks/useCustomers";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PhoneInput from "@/components/PhoneInput";
import TextInput from "@/components/TextInput";
import { apiFetch } from "@/lib/fetcher";

export default function NewCustomerForm() {
  const { closeOverlay, data } = useOverlay();
  const { mutate } = useCustomers();
  const existing = data?.mode === "edit" ? data?.customer : null;
  const isEdit = Boolean(existing?.id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    address: "",
    contactName: "",
    phone: "",
    email: "",
  });

  const isValidEmail = (v) => /^\S+@\S+\.\S+$/.test(String(v || "").trim());

  const initial = {
    name: existing?.name || "",
    address: existing?.address || "",
    contactName: existing?.contactName || "",
    phone: existing?.phone || "",
    email: existing?.email || "",
  };

  const [form, setForm] = useState(initial);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const nextErrors = { name: "", address: "", contactName: "", phone: "", email: "" };
    if (!String(form.name || "").trim()) nextErrors.name = "Please enter a customer name.";
    if (!String(form.address || "").trim()) nextErrors.address = "Please enter an address.";
    if (!String(form.contactName || "").trim()) nextErrors.contactName = "Please enter a contact name.";
    if (!String(form.phone || "").trim()) nextErrors.phone = "Please enter a phone number.";
    if (!String(form.email || "").trim()) nextErrors.email = "Please enter an email address.";
    else if (!isValidEmail(form.email)) nextErrors.email = "Please enter a valid email address.";

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({ name: "", address: "", contactName: "", phone: "", email: "" });
    setSubmitting(true);
    try {
      const body = {
        clientName: form.name,
        clientAddress: form.address,
        contactName: form.contactName,
        contactPhone: form.phone,
        contactEmail: form.email,
      };

      if (isEdit) {
        await apiFetch(`/clients/${existing.id}`, { method: "PUT", body });
      } else {
        await apiFetch("/clients", { method: "POST", body });
      }

      await mutate();
      closeOverlay();
    } catch (e) {
      const message = String(e?.data?.message || e?.message || (isEdit ? "Failed to update customer" : "Failed to create customer"));
      const field = String(e?.data?.field || "");
      const code = String(e?.data?.code || "");

      if (field === "contactEmail" || code === "EMAIL_IN_USE" || /email already in use/i.test(message)) {
        setFieldErrors((prev) => ({ ...prev, email: "This email is already in use." }));
      } else if (field === "contactPhone" || code === "PHONE_IN_USE" || /phone already in use/i.test(message)) {
        setFieldErrors((prev) => ({ ...prev, phone: "This phone number is already in use." }));
      } else if (/contactEmail/i.test(message)) {
        setFieldErrors((prev) => ({ ...prev, email: "Please enter a valid email address." }));
      } else if (/contactPhone/i.test(message)) {
        setFieldErrors((prev) => ({ ...prev, phone: "Please enter a phone number." }));
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const clearAll = () => setForm(initial);

  return (
    <form onSubmit={handleSubmit} className="overlay-form">
      <div className="overlay-topbar">
        <div className="overlay-title">{isEdit ? "EDIT CUSTOMER" : "ADD CUSTOMER"}</div>
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
            <TextInput
              bare
              placeholder="Enter Name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            {fieldErrors.name ? <div className="text-xs text-red-600 mt-1">{fieldErrors.name}</div> : null}
          </div>

          <div className="overlay-field">
            <label>Address</label>
            <TextInput
              bare
              placeholder="Enter Address"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
            {fieldErrors.address ? <div className="text-xs text-red-600 mt-1">{fieldErrors.address}</div> : null}
          </div>
        </div>

        <div className="overlay-section">
          <div className="overlay-section-title">2. Contact</div>

          <div className="overlay-field">
            <label>Contact Name</label>
            <TextInput
              bare
              placeholder="Enter Contact Name"
              value={form.contactName}
              onChange={(e) => update("contactName", e.target.value)}
            />
            {fieldErrors.contactName ? (
              <div className="text-xs text-red-600 mt-1">{fieldErrors.contactName}</div>
            ) : null}
          </div>

          <div className="overlay-field">
            <label>Contact Phone</label>
            <PhoneInput value={form.phone} onChange={(v) => update("phone", v)} />
            {fieldErrors.phone ? <div className="text-xs text-red-600 mt-1">{fieldErrors.phone}</div> : null}
          </div>

          <div className="overlay-field">
            <label>Contact E-mail</label>
            <TextInput
              bare
              type="email"
              placeholder="planning@customer.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            {fieldErrors.email ? <div className="text-xs text-red-600 mt-1">{fieldErrors.email}</div> : null}
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
