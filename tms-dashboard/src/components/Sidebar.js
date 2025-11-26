"use client";

import Link from "next/link";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import GroupIcon from "@mui/icons-material/Group";
import MapIcon from "@mui/icons-material/Map";

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
          <Inventory2Icon style={{ fontSize: 18 }} /> <span>Orders</span>
        </Link>
        <Link className="sidebar-link" href="/dashboard/customers">
          <GroupIcon style={{ fontSize: 18 }} /> <span>Customers</span>
        </Link>
        <Link className="sidebar-link" href="/dashboard/fleet/trucks">
          <LocalShippingIcon style={{ fontSize: 18 }} /> <span>Trucks</span>
        </Link>
        <Link className="sidebar-link" href="/dashboard/fleet/trailers">
          <MapIcon style={{ fontSize: 18 }} /> <span>Trailers</span>
        </Link>
        <Link className="sidebar-link" href="/dashboard/fleet/drivers">
          <GroupIcon style={{ fontSize: 18 }} /> <span>Drivers</span>
        </Link>
      </nav>
    </aside>
  );
}
