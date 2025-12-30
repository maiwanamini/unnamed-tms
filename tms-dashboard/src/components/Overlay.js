"use client";

import { useOverlay } from "@/hooks/useOverlay";
import NewCustomerForm from "./forms/NewCustomerForm";
import NewDriverForm from "./forms/NewDriverForm";
import NewOrderForm from "./forms/NewOrderForm";
import NewTrailerForm from "./forms/NewTrailerForm";
import NewTruckForm from "./forms/NewTruckForm";

export default function Overlay() {
  const { open, type, data, closeOverlay } = useOverlay();

  if (!open || !type) return null;

  const renderContent = () => {
    if (type === "customer") return <NewCustomerForm />;
    if (type === "driver") return <NewDriverForm />;
    if (type === "order") return <NewOrderForm {...(data || {})} />;
    if (type === "truck") return <NewTruckForm />;
    if (type === "trailer") return <NewTrailerForm />;
    // later: driver, truck, trailer, order...
    return null;
  };

  return (
    <div className="overlay-backdrop" role="dialog" aria-modal="true" onMouseDown={closeOverlay}>
      <div className="overlay-drawer" onMouseDown={(e) => e.stopPropagation()}>
        {renderContent()}
      </div>
    </div>
  );
}
