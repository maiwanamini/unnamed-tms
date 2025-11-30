"use client";

import { useEffect, useRef } from "react";
import StatusPill from "@/components/StatusPill";

export default function OrdersTable({ orders = [], selected, setSelected }) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // find the containing card so we can toggle the has-scrollbar class
    let card = wrapper.closest(".card.card-no-hpad");
    if (!card) {
      // fallback to any card ancestor (in case class names differ)
      card = wrapper.closest(".card");
    }
    if (!card) return;

    const update = () => {
      // treat overflow as the signal for adding padding. Using
      // scrollHeight > clientHeight works across platforms; we
      // previously required scrollbar to consume layout width which
      // can fail with overlay scrollbars. This is more permissive and
      // will add padding whenever body content overflows vertically.
      const has = wrapper.scrollHeight > wrapper.clientHeight;
      if (has) card.classList.add("has-scrollbar"); else card.classList.remove("has-scrollbar");
    };

    // initial
    update();

    // observe size changes
    let ro = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(update);
      ro.observe(wrapper);
    }

    // also listen to window resize as a fallback
    window.addEventListener("resize", update);

    // monitor for DOM changes inside the wrapper (rows added/removed)
    let mo = null;
    if (window.MutationObserver) {
      mo = new MutationObserver(update);
      mo.observe(wrapper, { childList: true, subtree: true });
    }

    return () => {
      if (ro) ro.disconnect();
      if (mo) mo.disconnect();
      window.removeEventListener("resize", update);
      // ensure class removed on unmount
      card.classList.remove("has-scrollbar");
    };
  }, [orders]);

  return (
    <>
      <div className="table-header">
        <table className="table" style={{ background: "transparent", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: '8%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>ID</th>
              <th style={{ textAlign: "left" }}>Client</th>
              <th style={{ textAlign: "left" }}>Truck</th>
              <th style={{ textAlign: "left" }}>Driver</th>
              <th style={{ textAlign: "left" }}>Origin</th>
              <th style={{ textAlign: "left" }}>Destination</th>
              <th style={{ textAlign: "left" }}>Status</th>
            </tr>
          </thead>
        </table>
      </div>

      <div className="table-wrapper" ref={wrapperRef}>
        <table className="table" style={{ background: "transparent", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: '8%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} onClick={() => setSelected(o)} style={{ cursor: "pointer", background: selected?.id === o.id ? "#eef2f7" : undefined }}>
                <td style={{ textAlign: "left" }}>{o.id}</td>
                <td style={{ textAlign: "left" }}>
                  <div>{o.client}</div>
                  <div style={{ color: "#9ca3af", fontSize: 12 }}>#Reference</div>
                </td>
                <td style={{ textAlign: "left" }}>
                  <div>{o.truck}</div>
                  <div style={{ color: "#9ca3af", fontSize: 12 }}>Truck</div>
                </td>
                <td style={{ textAlign: "left" }}>
                  <div>{o.driver}</div>
                  <div style={{ color: "#9ca3af", fontSize: 12 }}>Phone</div>
                </td>
                <td style={{ textAlign: "left" }}>
                  <div>{o.origin}</div>
                  <div style={{ color: "#9ca3af", fontSize: 12 }}>Date</div>
                </td>
                <td style={{ textAlign: "left" }}>
                  <div>{o.destination}</div>
                  <div style={{ color: "#9ca3af", fontSize: 12 }}>Date</div>
                </td>
                <td style={{ textAlign: "left" }}><StatusPill status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
