"use client";

import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

export default function StatusPill({ status }) {
  const normalize = (value) => {
    const v = String(value || "").trim().toLowerCase();
    if (!v) return "Pending";
    if (v === "en route" || v === "en-route" || v === "moving" || v === "in-progress" || v === "inprogress") return "Moving";
    if (v === "pending" || v === "assigned") return "Pending";
    if (v === "completed" || v === "complete") return "Completed";
    if (v === "canceled" || v === "cancelled" || v === "canceled") return "Canceled";
    // Already a display label?
    if (v === "moving" || v === "pending" || v === "completed" || v === "canceled" || v === "cancelled") return normalize(v);
    // Fallback: title-case first letter (keeps UX reasonable for unexpected statuses)
    return v.charAt(0).toUpperCase() + v.slice(1);
  };

  const disp = normalize(status);

  const cls =
    disp === "Moving"
      ? "status-pill status-moving"
      : disp === "Pending"
      ? "status-pill status-pending"
      : disp === "Completed"
      ? "status-pill status-completed"
      : "status-pill status-canceled";

  const icons = {
    Moving: <ArrowCircleRightOutlinedIcon fontSize="small" />,
    Pending: <AccessTimeOutlinedIcon fontSize="small" />,
    Completed: <CheckCircleOutlineIcon fontSize="small" />,
    Canceled: <CancelOutlinedIcon fontSize="small" />,
  };

  return (
    <span className={cls}>
      <span className="status-icon">{icons[disp] || icons.Pending}</span>
      <span className="status-text">{disp}</span>
    </span>
  );
}
