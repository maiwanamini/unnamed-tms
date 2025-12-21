"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Filter from "@/components/Filter";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function startOfDayUTC(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDaysUTC(date, deltaDays) {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return startOfDayUTC(d);
}

function startOfMonthUTC(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonthsUTC(date, deltaMonths) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  return new Date(Date.UTC(y, m + deltaMonths, 1));
}

function endOfMonthUTC(date) {
  const first = startOfMonthUTC(date);
  const next = addMonthsUTC(first, 1);
  return addDaysUTC(next, -1);
}

function formatMMDDYYYY(date) {
  if (!date) return "";
  const mm = pad2(date.getUTCMonth() + 1);
  const dd = pad2(date.getUTCDate());
  const yyyy = String(date.getUTCFullYear());
  return `${mm}/${dd}/${yyyy}`;
}

function monthLabel(date) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function isSameDayUTC(a, b) {
  if (!a || !b) return false;
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function compareDayUTC(a, b) {
  return startOfDayUTC(a).getTime() - startOfDayUTC(b).getTime();
}

function getWeekStartMondayUTC(date) {
  // Monday=0 ... Sunday=6
  const day = date.getUTCDay(); // Sunday=0
  const mondayIndex = (day + 6) % 7;
  return addDaysUTC(startOfDayUTC(date), -mondayIndex);
}

function makePresetRange(key, nowUTC) {
  const today = startOfDayUTC(nowUTC);

  switch (key) {
    case "today":
      return { start: today, end: today };
    case "yesterday": {
      const y = addDaysUTC(today, -1);
      return { start: y, end: y };
    }
    case "thisWeek": {
      const start = getWeekStartMondayUTC(today);
      const end = addDaysUTC(start, 6);
      return { start, end };
    }
    case "last7": {
      const start = addDaysUTC(today, -6);
      const end = today;
      return { start, end };
    }
    case "lastWeek": {
      const thisStart = getWeekStartMondayUTC(today);
      const start = addDaysUTC(thisStart, -7);
      const end = addDaysUTC(start, 6);
      return { start, end };
    }
    case "thisMonth": {
      const start = startOfMonthUTC(today);
      const end = endOfMonthUTC(today);
      return { start, end };
    }
    case "lastMonth": {
      const start = startOfMonthUTC(addMonthsUTC(today, -1));
      const end = endOfMonthUTC(start);
      return { start, end };
    }
    case "reset":
    default:
      return { start: null, end: null };
  }
}

function buildMonthGrid(monthStartUTC) {
  const first = startOfMonthUTC(monthStartUTC);
  const last = endOfMonthUTC(first);

  // Monday=0 ... Sunday=6
  const firstDow = (first.getUTCDay() + 6) % 7;
  const daysInMonth = last.getUTCDate();

  const cells = [];
  for (let i = 0; i < firstDow; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), d)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function DateRangeFilter({ label = "Choose Date", value, onChange }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  const nowUTC = useMemo(() => startOfDayUTC(new Date()), []);

  const [draftStart, setDraftStart] = useState(value?.start ? startOfDayUTC(value.start) : null);
  const [draftEnd, setDraftEnd] = useState(value?.end ? startOfDayUTC(value.end) : null);

  const [baseMonth, setBaseMonth] = useState(() => startOfMonthUTC(value?.start ? startOfDayUTC(value.start) : nowUTC));

  const syncDraftToValue = useCallback(() => {
    setDraftStart(value?.start ? startOfDayUTC(value.start) : null);
    setDraftEnd(value?.end ? startOfDayUTC(value.end) : null);
    setBaseMonth(startOfMonthUTC(value?.start ? startOfDayUTC(value.start) : nowUTC));
  }, [nowUTC, value?.end, value?.start]);

  useEffect(() => {
    function handleDoc(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) {
        setOpen(false);
        syncDraftToValue();
      }
    }

    function handleKey(e) {
      if (e.key === "Escape") {
        setOpen(false);
        syncDraftToValue();
      }
    }

    document.addEventListener("mousedown", handleDoc);
    document.addEventListener("touchstart", handleDoc);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleDoc);
      document.removeEventListener("touchstart", handleDoc);
      document.removeEventListener("keydown", handleKey);
    };
  }, [nowUTC, open, syncDraftToValue, value?.end, value?.start]);

  const appliedStart = value?.start ? startOfDayUTC(value.start) : null;
  const appliedEnd = value?.end ? startOfDayUTC(value.end) : null;

  const labelText = useMemo(() => {
    if (!appliedStart && !appliedEnd) return "All";
    const s = appliedStart;
    const e = appliedEnd || appliedStart;
    if (s && e && isSameDayUTC(s, e)) return formatMMDDYYYY(s);
    return `${formatMMDDYYYY(s)} - ${formatMMDDYYYY(e)}`;
  }, [appliedEnd, appliedStart]);

  const leftMonth = baseMonth;
  const rightMonth = addMonthsUTC(baseMonth, 1);
  const leftGrid = useMemo(() => buildMonthGrid(leftMonth), [leftMonth]);
  const rightGrid = useMemo(() => buildMonthGrid(rightMonth), [rightMonth]);

  const inRange = (date) => {
    if (!date || !draftStart) return false;
    const s = draftStart;
    const e = draftEnd || draftStart;
    const t = date.getTime();
    const a = Math.min(s.getTime(), e.getTime());
    const b = Math.max(s.getTime(), e.getTime());
    return t >= a && t <= b;
  };

  const isStart = (date) => !!draftStart && isSameDayUTC(date, draftStart);
  const isEnd = (date) => {
    const e = draftEnd || (draftStart ? draftStart : null);
    return !!e && isSameDayUTC(date, e);
  };

  const handleDayClick = (date) => {
    if (!date) return;

    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(date);
      setDraftEnd(null);
      return;
    }

    // draftStart exists, draftEnd not set
    if (compareDayUTC(date, draftStart) < 0) {
      setDraftStart(date);
      setDraftEnd(null);
      return;
    }

    setDraftEnd(date);
  };

  const applyEnabled = useMemo(() => {
    const s1 = draftStart ? draftStart.getTime() : null;
    const e1 = (draftEnd || (draftStart ? draftStart : null)) ? (draftEnd || draftStart).getTime() : null;
    const s2 = appliedStart ? appliedStart.getTime() : null;
    const e2 = (appliedEnd || (appliedStart ? appliedStart : null)) ? (appliedEnd || appliedStart).getTime() : null;
    return s1 !== s2 || e1 !== e2;
  }, [appliedEnd, appliedStart, draftEnd, draftStart]);

  const apply = () => {
    const nextStart = draftStart ? startOfDayUTC(draftStart) : null;
    const nextEnd = draftStart ? startOfDayUTC(draftEnd || draftStart) : null;
    onChange?.({ start: nextStart, end: nextEnd });
    setOpen(false);
  };

  const cancel = () => {
    setOpen(false);
    syncDraftToValue();
  };

  const setPreset = (key) => {
    const next = makePresetRange(key, nowUTC);
    setDraftStart(next.start);
    setDraftEnd(next.end);
    if (next.start) setBaseMonth(startOfMonthUTC(next.start));
    if (key === "reset") {
      setDraftStart(null);
      setDraftEnd(null);
      setBaseMonth(startOfMonthUTC(nowUTC));
    }
  };

  const weekLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const renderMonth = (monthStart, grid, side) => (
    <div className="drp-month" data-side={side}>
      <div className="drp-month-header">
        {side === "left" && (
          <button
            type="button"
            className="drp-nav drp-nav-prev"
            aria-label="Previous month"
            onClick={() => setBaseMonth((m) => addMonthsUTC(m, -1))}
          >
            <KeyboardArrowLeftIcon style={{ fontSize: 24 }} />
          </button>
        )}
        <div className="drp-month-title">{monthLabel(monthStart)}</div>
        {side === "right" && (
          <button
            type="button"
            className="drp-nav drp-nav-next"
            aria-label="Next month"
            onClick={() => setBaseMonth((m) => addMonthsUTC(m, 1))}
          >
            <KeyboardArrowRightIcon style={{ fontSize: 24 }} />
          </button>
        )}
      </div>
      <div className="drp-weekdays">
        {weekLabels.map((w) => (
          <div key={w} className="drp-weekday">
            {w}
          </div>
        ))}
      </div>
      <div className="drp-grid">
        {grid.map((d, idx) => {
          if (!d) return <div key={`${side}-empty-${idx}`} className="drp-day drp-empty" />;
          const active = inRange(d);
          const start = isStart(d);
          const end = isEnd(d);
          const cls = [
            "drp-day",
            active ? "in-range" : "",
            start ? "is-start" : "",
            end ? "is-end" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button key={`${side}-${d.toISOString()}`} type="button" className={cls} onClick={() => handleDayClick(d)}>
              {d.getUTCDate()}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Filter label={label}>
      <div ref={ref} style={{ position: "relative" }}>
        <button
          type="button"
          className="filter min-w-[120px] max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis"
          onClick={() => {
            if (!open) syncDraftToValue();
            setOpen((v) => !v);
          }}
        >
          <span className="truncate">{labelText}</span>
          <KeyboardArrowDownIcon className={`status-chevron ${open ? "open" : ""} shrink-0`} style={{ fontSize: 16, color: "#6b7280" }} />
        </button>

        {open && (
          <div className="date-range-popover">
            <div className="date-range-body">
              <div className="drp-presets">
                <button type="button" className="drp-preset" onClick={() => setPreset("today")}>
                  Today
                </button>
                <button type="button" className="drp-preset" onClick={() => setPreset("yesterday")}>
                  Yesterday
                </button>
                <button type="button" className="drp-preset" onClick={() => setPreset("thisWeek")}>
                  This Week
                </button>
                <button type="button" className="drp-preset" onClick={() => setPreset("last7")}>
                  Last 7 Days
                </button>
                <button type="button" className="drp-preset" onClick={() => setPreset("lastWeek")}>
                  Last Week
                </button>
                <button type="button" className="drp-preset" onClick={() => setPreset("thisMonth")}>
                  This Month
                </button>
                <button type="button" className="drp-preset" onClick={() => setPreset("lastMonth")}>
                  Last Month
                </button>
              </div>

              <div className="drp-main">
                <div className="drp-inputs">
                  <div className="drp-input">
                    <div className="drp-input-label">Start Date</div>
                    <input readOnly value={draftStart ? formatMMDDYYYY(draftStart) : ""} placeholder="MM / DD / YYYY" />
                  </div>
                  <div className="drp-input">
                    <div className="drp-input-label">End Date</div>
                    <input readOnly value={draftEnd ? formatMMDDYYYY(draftEnd) : ""} placeholder="MM / DD / YYYY" />
                  </div>
                </div>

                <div className="drp-cal">
                  <div className="drp-months">
                    {renderMonth(leftMonth, leftGrid, "left")}
                    {renderMonth(rightMonth, rightGrid, "right")}
                  </div>
                </div>

                <div className="drp-actions">
                  <button type="button" className="drp-btn drp-cancel" onClick={() => setPreset("reset")}>
                    RESET
                  </button>
                  <div className="drp-actions-right">
                    <button type="button" className="drp-btn drp-cancel" onClick={cancel}>
                      CANCEL
                    </button>
                    <button type="button" className="drp-btn drp-apply" onClick={apply} disabled={!applyEnabled}>
                      APPLY
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Filter>
  );
}
