"use client";

import StatusPill from '@/components/StatusPill';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';

export default function StopCard({ stop }) {
  // display 'En route' as 'Moving' to match header/status pill
  const status = (stop.status === 'En route' ? 'Moving' : stop.status) || 'Pending';

  const iconMap = {
    Moving: <ArrowCircleRightOutlinedIcon style={{ fontSize: 18, color: '#075985' }} />,
    Pending: <AccessTimeOutlinedIcon style={{ fontSize: 18, color: '#92400e' }} />,
    Completed: <CheckCircleOutlineIcon style={{ fontSize: 18, color: '#065f46' }} />,
  };

  const flagClass = status === 'Completed' ? 'completed' : status === 'Moving' ? 'moving' : 'pending';

  // color map to match pill text colors
  const statusColorMap = {
    Moving: '#075985',
    Pending: '#92400e',
    Completed: '#065f46',
  };
  const statusColor = statusColorMap[status] || '#6b7280';

  const typeColor = stop.type === 'pickup' ? '#065f46' : '#9f1239';
  const typeIcon = stop.type === 'pickup'
    ? <UploadIcon style={{ fontSize: 20, color: typeColor }} />
    : <DownloadIcon style={{ fontSize: 20, color: typeColor }} />;

  return (
    <div className="stop-card">
      <div className={`stop-flag ${flagClass}`}></div>
      <div className="stop-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <div className="badge" style={{ background: stop.type === 'pickup' ? '#ecfdf5' : '#fff1f2', color: stop.type === 'pickup' ? '#065f46' : '#9f1239', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{typeIcon}<span>{stop.type === 'pickup' ? 'Pick up' : 'Drop off'}</span></span>
              </div>
            </div>
            <div className="stop-title">{stop.title}</div>
            <div className="stop-sub">{stop.address}</div>
          </div>
        </div>

        <div className="stop-row">
          <div className="meta">
            <div className="meta-label">Ref</div>
            <div className="meta-value">{stop.ref}</div>

            <div style={{ height: 12 }} />

            <div className="meta-label">Appointment time</div>
            <div className="meta-value">{stop.time}</div>
          </div>
          <div style={{ marginLeft: 'auto' }} />
        </div>

        {stop.note && (
          <div className="stop-row">
            <div className="meta">
              <div className="meta-label">Note</div>
              <div className="meta-value">{stop.note}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
