"use client";

import Link from "next/link";
import { Package, Seatbelt, Truck, TruckTrailer, Users } from "@phosphor-icons/react";

export default function Sidebar() {
  return (
    <aside
      style={{
        width: "230px",
        background: "#ffffff",
        borderRight: "1px solid #e5e7eb",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div>
        <h1 style={{ fontSize: "18px", fontWeight: 600 }}>Unnamed TMS</h1>
        <p style={{ fontSize: "12px", color: "#6b7280" }}>Dashboard</p>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <Link className="sidebar-link" href="/dashboard/orders">
          <Package size={18} weight="fill" /> <span>Orders</span>
        </Link>
        <Link className="sidebar-link" href="/dashboard/customers">
          <Users size={18} weight="fill" /> <span>Customers</span>
        </Link>
        <Link className="sidebar-link" href="/dashboard/trucks">
          <Truck size={18} weight="fill" /> <span>Trucks</span>
        </Link>
        <Link className="sidebar-link" href="/dashboard/trailers">
          <TruckTrailer size={18} weight="fill" /> <span>Trailers</span>
        </Link>
        <Link className="sidebar-link" href="/dashboard/drivers">
          <Seatbelt size={18} weight="fill" /> <span>Drivers</span>
        </Link>
      </nav>
    </aside>
  );
}
