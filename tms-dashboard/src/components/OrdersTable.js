"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TableFooter from "@/components/TableFooter";
import StatusPill from "@/components/StatusPill";
import { prettyTrailerType, prettyTruckType } from "@/lib/vehicle";
import PortalSelect from "@/components/PortalSelect";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";

function startOfDayLocal(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDayLocal(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatShortDateLocal(date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

function Cell({ children }) {
  return <div className="table-cell-center">{children}</div>;
}

export default function OrdersTable({
  orders = [],
  selected,
  setSelected,
  drivers = [],
  trucks = [],
  trailers = [],
  onAssignDriver,
  onAssignTruck,
  onAssignTrailer,
}) {
  const wrapperRef = useRef(null);
  const [rowsPerPage, setRowsPerPage] = useState(Infinity);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null); // { id, field }

  const todayLocal = useMemo(() => startOfDayLocal(new Date()), []);
  const yesterdayLocal = useMemo(() => {
    const d = new Date(todayLocal.getTime());
    d.setDate(d.getDate() - 1);
    return startOfDayLocal(d);
  }, [todayLocal]);

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
      const raw = o?.tableDate || o?.createdAt || o?.date;
      const parsed = raw ? new Date(raw) : new Date();
      return startOfDayLocal(parsed).getTime();
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

  const pageSlice = useMemo(() => {
    if (rowsPerPage === Infinity) return sortedOrders;
    const start = page * rowsPerPage;
    const end = Math.min(start + rowsPerPage, sortedOrders.length);
    return sortedOrders.slice(start, end);
  }, [page, rowsPerPage, sortedOrders]);

  const isEditing = (id, field) => editing?.id === id && editing?.field === field;

  const groupedRows = useMemo(() => {
    const labelFor = (o) => {
      const raw = o?.tableDate || o?.createdAt || o?.date;
      const parsed = raw ? new Date(raw) : new Date();
      const day = startOfDayLocal(parsed);
      if (isSameDayLocal(day, todayLocal)) return "Today";
      if (isSameDayLocal(day, yesterdayLocal)) return "Yesterday";
      return formatShortDateLocal(day);
    };

    const out = [];
    let lastLabel = null;
    for (const o of pageSlice) {
      const label = labelFor(o);
      if (label !== lastLabel) {
        out.push({ type: "group", key: `g-${label}`, label });
        lastLabel = label;
      }
      out.push({ type: "order", key: o.id, order: o });
    }
    return out;
  }, [pageSlice, todayLocal, yesterdayLocal]);

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
    { key: "trailer", label: "Trailer", width: '3rem' },
    { key: "driver", label: "Driver", width: '3rem' },
    { key: "origin", label: "Origin", width: '5rem' },
    { key: "destination", label: "Destination", width: '5rem' },
    { key: "status", label: "Status", width: '3rem' },
  ];

  const cellPad = '6px 6px';

  return (
    <div className="w-full" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Scroll container takes remaining height; body/header scroll together horizontally */}
      <div className="table-wrapper" ref={wrapperRef} style={{ flex: '1 1 0%', minHeight: 0, overflowY: 'auto', overflowX: 'auto' }}>
        {/* Force a wider inner box so the wrapper shows a horizontal scrollbar when needed */}
        <div className="min-w-[1100px] inline-block align-top">
          <table className="orders-table w-full" style={{ borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed' }}>
          <colgroup>
            {columnDefs.map((c) => (
              <col key={c.key} style={{ width: c.width }} />
            ))}
          </colgroup>
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              {columnDefs.map((c) => (
                <th key={c.key} style={{ textAlign: 'left', padding: cellPad, fontWeight: 600, fontSize: 14, color: '#0f172a', background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupedRows.map((row) => {
              if (row.type === "group") {
                return (
                  <tr key={row.key} className="orders-date-group" aria-hidden="true">
                    <td colSpan={columnDefs.length}>
                      <div className="orders-date-divider">
                        <span className="orders-date-pill">{row.label}</span>
                        <span className="orders-date-line" />
                      </div>
                    </td>
                  </tr>
                );
              }

              const o = row.order;
              const orderDbId = String(o?.dbId || "");
              const editKey = orderDbId || String(o?.id || "");
              const canAssignTruck = !o.truck && !!orderDbId && typeof onAssignTruck === "function";
              const canAssignTrailer = !o.trailer && !!orderDbId && typeof onAssignTrailer === "function";
              const canAssignDriver = !o.driver && !!orderDbId && typeof onAssignDriver === "function";

              const refText = String(o.reference || "").trim();
              const refDisplay = refText ? (refText.startsWith("#") ? refText : `#${refText}`) : "";
              return (
                <tr
                  key={row.key}
                  onClick={() => setSelected(o)}
                  className={selected?.id === o.id ? 'selected' : ''}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ padding: cellPad }}>
                    <Cell>{o.id}</Cell>
                  </td>
                  <td style={{ padding: cellPad }}>
                    <Cell>
                      <div>
                        <div>{o.customer ?? o.client}</div>
                        <div style={{ color: '#9ca3af', fontSize: 14 }}>{refDisplay}</div>
                      </div>
                    </Cell>
                  </td>
                  <td style={{ padding: cellPad }}>
                    <Cell>
                      {isEditing(editKey, "truck") ? (
                        <PortalSelect
                          value={String(o.truckId || "")}
                          onChange={(v) => {
                            onAssignTruck?.(orderDbId, v || null);
                          }}
                          placeholder=""
                          options={trucks.map((t) => ({ value: t.id, label: t.name }))}
                          alwaysShowSearch
                          triggerClassName="assign-select assign-select-trigger"
                          menuClassName="status-dropdown assign-select-dropdown"
                          openOnMount
                          onClose={() => setEditing(null)}
                        />
                      ) : o.truck ? (
                        <div>
                          <div>{o.truck}</div>
                          {prettyTruckType(o.truckType) ? (
                            <div style={{ color: '#9ca3af', fontSize: 14 }}>{prettyTruckType(o.truckType)}</div>
                          ) : (
                            <div style={{ color: '#9ca3af', fontSize: 14 }} />
                          )}
                        </div>
                      ) : canAssignTruck ? (
                        <button
                          type="button"
                          className="assign-link"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => setEditing({ id: editKey, field: "truck" })}
                        >
                          <AddBoxOutlinedIcon style={{ fontSize: 20 }} />
                          <span>Add truck</span>
                        </button>
                      ) : (
                        <div />
                      )}
                    </Cell>
                  </td>
                  <td style={{ padding: cellPad }}>
                    <Cell>
                      {isEditing(editKey, "trailer") ? (
                        <PortalSelect
                          value={String(o.trailerId || "")}
                          onChange={(v) => {
                            onAssignTrailer?.(orderDbId, v || null);
                          }}
                          placeholder=""
                          options={trailers.map((t) => ({ value: t.id, label: t.name }))}
                          alwaysShowSearch
                          triggerClassName="assign-select assign-select-trigger"
                          menuClassName="status-dropdown assign-select-dropdown"
                          openOnMount
                          onClose={() => setEditing(null)}
                        />
                      ) : o.trailer ? (
                        <div>
                          <div>{o.trailer}</div>
                          <div style={{ color: '#9ca3af', fontSize: 14 }}>
                            {[String(o.trailerNumber || '').trim(), prettyTrailerType(o.trailerType)].filter(Boolean).join(' ')}
                          </div>
                        </div>
                      ) : canAssignTrailer ? (
                        <button
                          type="button"
                          className="assign-link"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => setEditing({ id: editKey, field: "trailer" })}
                        >
                          <AddBoxOutlinedIcon style={{ fontSize: 20 }} />
                          <span>Add trailer</span>
                        </button>
                      ) : (
                        <div />
                      )}
                    </Cell>
                  </td>
                  <td style={{ padding: cellPad }}>
                    <Cell>
                      {isEditing(editKey, "driver") ? (
                        <PortalSelect
                          value={String(o.driverId || "")}
                          onChange={(v) => {
                            onAssignDriver?.(orderDbId, v || null);
                          }}
                          placeholder=""
                          options={drivers.map((d) => ({ value: d.id, label: d.name, avatarUrl: d.avatarUrl }))}
                          alwaysShowSearch
                          triggerClassName="assign-select assign-select-trigger"
                          menuClassName="status-dropdown assign-select-dropdown"
                          openOnMount
                          onClose={() => setEditing(null)}
                        />
                      ) : o.driver ? (
                        <div>
                          <div>{o.driver}</div>
                          <div style={{ color: '#9ca3af', fontSize: 14 }}>{o.driverPhone || ""}</div>
                        </div>
                      ) : canAssignDriver ? (
                        <button
                          type="button"
                          className="assign-link"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => setEditing({ id: editKey, field: "driver" })}
                        >
                          <PersonAddAltOutlinedIcon style={{ fontSize: 20 }} />
                          <span>Add driver</span>
                        </button>
                      ) : (
                        <div />
                      )}
                    </Cell>
                  </td>
                  <td style={{ padding: cellPad }}>
                    <Cell>
                      <div>
                        <div>{o.origin}</div>
                        <div style={{ color: '#9ca3af', fontSize: 14 }}>{o.originDate || ""}</div>
                      </div>
                    </Cell>
                  </td>
                  <td style={{ padding: cellPad }}>
                    <Cell>
                      <div>
                        <div>{o.destination}</div>
                        <div style={{ color: '#9ca3af', fontSize: 14 }}>{o.destinationDate || ""}</div>
                      </div>
                    </Cell>
                  </td>
                  <td style={{ padding: cellPad }}>
                    <Cell>
                      <StatusPill status={o.status} />
                    </Cell>
                  </td>
                </tr>
              );
            })}
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
