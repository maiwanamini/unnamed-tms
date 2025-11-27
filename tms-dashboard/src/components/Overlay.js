"use client";

import { useOverlay } from "@/hooks/useOverlay";
import NewCustomerForm from "./forms/NewCustomerForm";

export default function Overlay() {
  const { open, type, closeOverlay } = useOverlay();

  if (!open || !type) return null;

  const renderContent = () => {
    if (type === "customer") return <NewCustomerForm />;
    // later: driver, truck, trailer, order...
    return null;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: "420px",
          maxWidth: "100%",
          height: "100%",
          background: "#ffffff",
          padding: "24px",
          overflowY: "auto",
          boxShadow: "-4px 0 16px rgba(15,23,42,0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 600 }}>New {type}</h2>
          <button className="btn-ghost" onClick={closeOverlay}>
            Close
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
