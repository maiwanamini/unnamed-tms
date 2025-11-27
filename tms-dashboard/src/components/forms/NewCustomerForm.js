"use client";

import { useState } from "react";
import { useOverlay } from "@/hooks/useOverlay";
import { useCustomers } from "@/hooks/useCustomers";

export default function NewCustomerForm() {
  const { closeOverlay } = useOverlay();
  const { mutate } = useCustomers();

  const [form, setForm] = useState({
    name: "",
    address: "",
    contactName: "",
    phone: "",
    email: "",
  });

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("http://localhost:4000/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    // refresh SWR cache
    mutate();
    closeOverlay();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div>
        <label style={{ fontSize: "13px" }}>Customer name</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>

      <div>
        <label style={{ fontSize: "13px" }}>Address</label>
        <input
          className="input"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
        />
      </div>

      <div>
        <label style={{ fontSize: "13px" }}>Contact person</label>
        <input
          className="input"
          value={form.contactName}
          onChange={(e) => update("contactName", e.target.value)}
        />
      </div>

      <div>
        <label style={{ fontSize: "13px" }}>Phone</label>
        <input
          className="input"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
      </div>

      <div>
        <label style={{ fontSize: "13px" }}>Email</label>
        <input
          className="input"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
          marginTop: "8px",
        }}
      >
        <button
          type="button"
          className="btn-ghost"
          onClick={closeOverlay}
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Create
        </button>
      </div>
    </form>
  );
}
