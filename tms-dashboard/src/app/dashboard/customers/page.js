"use client";

import { useOverlay } from "@/hooks/useOverlay";
import Overlay from "@/components/Overlay";
import { useCustomers } from "@/hooks/useCustomers";

export default function CustomersPage() {
  const { openOverlay } = useOverlay();
  const { customers, isLoading } = useCustomers();

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600 }}>Customers</h1>
          <p style={{ fontSize: "13px", color: "#6b7280" }}>
            Manage your customer list here.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => openOverlay("customer")}
        >
          + New
        </button>
      </div>

      {isLoading ? (
        <p>Loading customers…</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Full name</th>
              <th>Contact</th>
              <th>Phone</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id || c.id}>
                <td>{c.name}</td>
                <td style={{ textAlign: "center" }}>{c.contactName}</td>
                <td style={{ textAlign: "center" }}>{c.phone}</td>
                <td style={{ textAlign: "center" }}>{c.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Overlay />
    </>
  );
}
