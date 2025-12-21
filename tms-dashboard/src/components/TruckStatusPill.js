"use client";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

export default function TruckStatusPill({ status }) {
  const disp = String(status || "");
  const normalized = disp.toLowerCase() === "inactive" ? "Inactive" : "Active";

  const cls =
    normalized === "Active"
      ? "status-pill truck-status-active"
      : "status-pill truck-status-inactive";

  const icon = normalized === "Active" ? <CheckCircleOutlineIcon fontSize="small" /> : <CancelOutlinedIcon fontSize="small" />;

  return (
    <span className={cls}>
      <span className="status-icon">{icon}</span>
      <span className="status-text">{normalized}</span>
    </span>
  );
}
