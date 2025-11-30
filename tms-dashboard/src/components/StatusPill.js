"use client";

import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

export default function StatusPill({ status }) {
  // normalize 'En route' to 'Moving' so both use same label and styles
  const disp = status === 'En route' ? 'Moving' : status;

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
      <span className="status-icon">{icons[disp]}</span>
      <span className="status-text">{disp}</span>
    </span>
  );
}
