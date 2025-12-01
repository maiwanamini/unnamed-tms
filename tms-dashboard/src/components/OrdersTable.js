"use client";

import { useEffect, useRef, useState } from "react";
import TableFooter from "@/components/TableFooter";
import StatusPill from "@/components/StatusPill";

export default function OrdersTable({ orders = [], selected, setSelected }) {
  const wrapperRef = useRef(null);
  const [rowsPerPage, setRowsPerPage] = useState(Infinity);
  const [page, setPage] = useState(0);

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
    { key: "id", label: "ID", width: 120 },
    { key: "client", label: "Client", width: 200 },
    { key: "truck", label: "Truck", width: 120 },
    { key: "driver", label: "Driver", width: 160 },
    { key: "origin", label: "Origin", width: 240 },
    { key: "destination", label: "Destination", width: 240 },
    { key: "status", label: "Status", width: 120 },
  ];

  const getSlice = () => {
    if (rowsPerPage === Infinity) return orders;
    const start = page * rowsPerPage;
    const end = Math.min(start + rowsPerPage, orders.length);
    return orders.slice(start, end);
  };

  return (
    <div className="w-full">
      {/* Vertical scroll container; the horizontal scroll comes from parent wrapper */}
      <div className="table-wrapper" ref={wrapperRef}>
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
                <th key={c.key} style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600, fontSize: 13, color: '#0f172a', background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>{c.label}</th>
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
                <td style={{ padding: '12px 8px' }}>{o.id}</td>
                <td style={{ padding: '12px 8px' }}>
                  <div>{o.client}</div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>#Reference</div>
                </td>
                <td style={{ padding: '12px 8px' }}>
                  <div>{o.truck}</div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>Truck</div>
                </td>
                <td style={{ padding: '12px 8px' }}>
                  <div>{o.driver}</div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>Phone</div>
                </td>
                <td style={{ padding: '12px 8px' }}>
                  <div>{o.origin}</div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>Date</div>
                </td>
                <td style={{ padding: '12px 8px' }}>
                  <div>{o.destination}</div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>Date</div>
                </td>
                <td style={{ padding: '12px 8px' }}><StatusPill status={o.status} /></td>
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
