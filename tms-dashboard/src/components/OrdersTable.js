"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TableFooter from "@/components/TableFooter";
import StatusPill from "@/components/StatusPill";

function startOfDayUTC(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function isSameDayUTC(a, b) {
  if (!a || !b) return false;
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function formatShortDateUTC(date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

export default function OrdersTable({ orders = [], selected, setSelected }) {
  const wrapperRef = useRef(null);
  const [rowsPerPage, setRowsPerPage] = useState(Infinity);
  const [page, setPage] = useState(0);

  const todayUTC = useMemo(() => startOfDayUTC(new Date()), []);
  const yesterdayUTC = useMemo(() => {
    const d = new Date(todayUTC.getTime());
    d.setUTCDate(d.getUTCDate() - 1);
    return startOfDayUTC(d);
  }, [todayUTC]);

  const sortedOrders = useMemo(() => {
    const norm = (s) => {
      const v = String(s || "");
      return v === "En route" ? "Moving" : v;
    };
    const rank = (s) => {
      switch (String(s || "").toLowerCase()) {
        case "pending":
          return 0;
        case "moving":
          return 1;
        case "completed":
          return 2;
        case "canceled":
        case "cancelled":
          return 3;
        default:
          return 99;
      }
    };

    const dayKey = (o) => {
      const raw = o?.createdAt;
      const parsed = raw ? new Date(raw) : new Date();
      return startOfDayUTC(parsed).getTime();
    };

    return orders
      .map((o, idx) => ({ o: { ...o, status: norm(o.status) }, idx, day: dayKey(o) }))
      .sort((a, b) => {
        const dd = b.day - a.day; // newest day first (Today, then Yesterday, etc.)
        if (dd !== 0) return dd;
        const ds = rank(a.o.status) - rank(b.o.status); // within day: Pending -> Moving -> Completed -> Canceled
        return ds !== 0 ? ds : a.idx - b.idx;
      })
      .map((x) => x.o);
  }, [orders]);

  const rows = useMemo(() => {
    const slice = (() => {
      if (rowsPerPage === Infinity) return sortedOrders;
      const start = page * rowsPerPage;
      const end = Math.min(start + rowsPerPage, sortedOrders.length);
      return sortedOrders.slice(start, end);
    })();

    const labelFor = (o) => {
      const raw = o?.createdAt;
      const parsed = raw ? new Date(raw) : new Date();
      const day = startOfDayUTC(parsed);
      if (isSameDayUTC(day, todayUTC)) return "Today";
      if (isSameDayUTC(day, yesterdayUTC)) return "Yesterday";
      return formatShortDateUTC(day);
    };

    const out = [];
    let lastLabel = null;
    for (const o of slice) {
      const label = labelFor(o);
      if (label !== lastLabel) {
        out.push({ type: "group", key: `g-${label}`, label });
        lastLabel = label;
      }
      out.push({ type: "order", key: o.id, order: o });
    }

    return out;
  }, [page, rowsPerPage, sortedOrders, todayUTC, yesterdayUTC]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let card = wrapper.closest(".card.card-no-hpad");
    if (!card) card = wrapper.closest(".card");
    if (!card) return;

    const update = () => {
      const has = wrapper.scrollHeight > wrapper.clientHeight;
      if (has) card.classList.add("has-scrollbar"); else card.classList.remove("has-scrollbar");
    };

    update();

    let ro = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(update);
      ro.observe(wrapper);
    }

    window.addEventListener("resize", update);

    let mo = null;
    if (window.MutationObserver) {
      mo = new MutationObserver(update);
      mo.observe(wrapper, { childList: true, subtree: true });
    }

    return () => {
      if (ro) ro.disconnect();
      if (mo) mo.disconnect();
      window.removeEventListener("resize", update);
      card.classList.remove("has-scrollbar");
    };
  }, [orders]);

  // Fixed pixel widths to prevent column shrinking and keep header/body in sync
  const columnDefs = [
    { key: "id", label: "ID", width: '3rem' },
    { key: "client", label: "Client", width: '3rem' },
    { key: "truck", label: "Truck", width: '3rem' },
    { key: "driver", label: "Driver", width: '3rem' },
    { key: "origin", label: "Origin", width: '5rem' },
    { key: "destination", label: "Destination", width: '5rem' },
    { key: "status", label: "Status", width: '3rem' },
  ];

  return (
    <div className="w-full" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Scroll container takes remaining height; body/header scroll together horizontally */}
      <div className="table-wrapper" ref={wrapperRef} style={{ flex: '1 1 0%', minHeight: 0, overflowY: 'auto', overflowX: 'auto' }}>
        {/* Force a wider inner box so the wrapper shows a horizontal scrollbar when needed */}
        <div className="min-w-[1250px] inline-block align-top">
          <table className="orders-table w-full" style={{ borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed' }}>
          <colgroup>
            {columnDefs.map((c) => (
              <col key={c.key} style={{ width: c.width }} />
            ))}
          </colgroup>
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              {columnDefs.map((c) => (
                <th key={c.key} style={{ textAlign: 'left', padding: '8px 8px', fontWeight: 600, fontSize: 14, color: '#0f172a', background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getSlice().map((o) => (
              <tr
                key={o.id}
                onClick={() => setSelected(o)}
                className={selected?.id === o.id ? 'selected' : ''}
                style={{ cursor: 'pointer' }}
              >
                <td style={{ padding: '8px 8px' }}>{o.id}</td>
                <td style={{ padding: '8px 8px' }}>
                  <div>{o.client}</div>
                  <div style={{ color: '#9ca3af', fontSize: 14 }}>#Reference</div>
                </td>
                <td style={{ padding: '8px 8px' }}>
                  <div>{o.truck}</div>
                  <div style={{ color: '#9ca3af', fontSize: 14 }}>Truck</div>
                </td>
                <td style={{ padding: '8px 8px' }}>
                  <div>{o.driver}</div>
                  <div style={{ color: '#9ca3af', fontSize: 14 }}>Phone</div>
                </td>
                <td style={{ padding: '8px 8px' }}>
                  <div>{o.origin}</div>
                  <div style={{ color: '#9ca3af', fontSize: 14 }}>Date</div>
                </td>
                <td style={{ padding: '8px 8px' }}>
                  <div>{o.destination}</div>
                  <div style={{ color: '#9ca3af', fontSize: 14 }}>Date</div>
                </td>
                <td style={{ padding: '8px 8px' }}><StatusPill status={o.status} /></td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      <TableFooter
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        page={page}
        setPage={setPage}
        total={orders.length}
      />
    </div>
  );
}
