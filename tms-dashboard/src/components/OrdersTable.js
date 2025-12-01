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

  // Use fixed pixel widths to prevent column shrinking and keep header/body in sync
  const cols = '120px 200px 120px 160px 240px 240px 120px';

  return (
    <div className="min-w-[1100px] w-full">
      <div className="table-header">
        <div className="orders-grid orders-header-grid" style={{ gridTemplateColumns: cols }}>
          <div className="orders-cell orders-header">ID</div>
          <div className="orders-cell orders-header">Client</div>
          <div className="orders-cell orders-header">Truck</div>
          <div className="orders-cell orders-header">Driver</div>
          <div className="orders-cell orders-header">Origin</div>
          <div className="orders-cell orders-header">Destination</div>
          <div className="orders-cell orders-header">Status</div>
        </div>
      </div>

      <div className="table-wrapper" ref={wrapperRef}>
        <div className="orders-body">
          {(() => {
            let slice;
            if (rowsPerPage === Infinity) {
              slice = orders;
            } else {
              const start = page * rowsPerPage;
              const end = Math.min(start + rowsPerPage, orders.length);
              slice = orders.slice(start, end);
            }
            return slice.map((o) => (
              <div
                key={o.id}
                className={`orders-row ${selected?.id === o.id ? 'selected' : ''}`}
                onClick={() => setSelected(o)}
                style={{ cursor: 'pointer', gridTemplateColumns: cols }}
              >
                <div className="orders-cell">{o.id}</div>
                <div className="orders-cell">
                  <div>{o.client}</div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>#Reference</div>
                </div>
                <div className="orders-cell">
                  <div>{o.truck}</div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>Truck</div>
                </div>
                <div className="orders-cell">
                  <div>{o.driver}</div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>Phone</div>
                </div>
                <div className="orders-cell">
                  <div>{o.origin}</div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>Date</div>
                </div>
                <div className="orders-cell">
                  <div>{o.destination}</div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>Date</div>
                </div>
                <div className="orders-cell"><StatusPill status={o.status} /></div>
              </div>
            ));
          })()}
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
