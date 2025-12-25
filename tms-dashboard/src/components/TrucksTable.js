"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TableFooter from "@/components/TableFooter";
import TruckStatusPill from "@/components/TruckStatusPill";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";

function formatDate(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getUTCFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

export default function TrucksTable({ trucks = [], drivers = [], trailers = [], onAssignDriver, onAssignTrailer }) {
  const wrapperRef = useRef(null);
  const [rowsPerPage, setRowsPerPage] = useState(Infinity);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null); // { id, field }

  const sortedTrucks = useMemo(() => {
    const rank = (value) => (String(value || "").toLowerCase() === "inactive" ? 1 : 0);
    return trucks
      .map((t, idx) => ({ t, idx }))
      .sort((a, b) => {
        const d = rank(a.t.status) - rank(b.t.status);
        return d !== 0 ? d : a.idx - b.idx;
      })
      .map((x) => x.t);
  }, [trucks]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let card = wrapper.closest(".card.card-no-hpad");
    if (!card) card = wrapper.closest(".card");
    if (!card) return;

    const update = () => {
      const has = wrapper.scrollHeight > wrapper.clientHeight;
      if (has) card.classList.add("has-scrollbar");
      else card.classList.remove("has-scrollbar");
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
  }, [trucks]);

  const handleSetRowsPerPage = (next) => {
    setRowsPerPage(next);
    setPage(0);
  };

  const columnDefs = useMemo(
    () => [
      { key: "licensePlate", label: "License Plate", width: 140 },
      { key: "truck", label: "Truck", width: 260 },
      { key: "status", label: "Status", width: 140 },
      { key: "driver", label: "Driver", width: 180 },
      { key: "trailer", label: "Trailer", width: 180 },
      { key: "createdAt", label: "Created At", width: 140 },
    ],
    []
  );

  const slice = useMemo(() => {
    if (rowsPerPage === Infinity) return sortedTrucks;
    const start = page * rowsPerPage;
    const end = Math.min(start + rowsPerPage, sortedTrucks.length);
    return sortedTrucks.slice(start, end);
  }, [sortedTrucks, page, rowsPerPage]);

  const isEditing = (id, field) => editing?.id === id && editing?.field === field;

  return (
    <div className="w-full">
      <div className="table-wrapper" ref={wrapperRef}>
        <div className="min-w-[1200px] inline-block align-top">
          <table className="orders-table w-full" style={{ borderCollapse: "separate", borderSpacing: 0, tableLayout: "fixed" }}>
            <colgroup>
              {columnDefs.map((c) => (
                <col key={c.key} style={{ width: c.width }} />
              ))}
            </colgroup>
            <thead className="sticky top-0 z-10 bg-white">
              <tr>
                {columnDefs.map((c) => (
                  <th
                    key={c.key}
                    style={{
                      textAlign: "left",
                      padding: "12px 8px",
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#0f172a",
                      background: "#ffffff",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.map((t) => (
                <tr key={t.id}>
                  <td style={{ padding: "12px 8px" }}>{t.licensePlate || ""}</td>
                  <td style={{ padding: "12px 8px" }}>{t.truck || ""}</td>
                  <td style={{ padding: "12px 8px" }}>
                    <TruckStatusPill status={t.status} />
                  </td>

                  <td style={{ padding: "12px 8px" }}>
                    {isEditing(t.id, "driver") ? (
                      <select
                        className="assign-select"
                        value={t.driverId || ""}
                        onChange={(e) => {
                          const next = e.target.value;
                          if (next) onAssignDriver?.(t.id, next);
                          setEditing(null);
                        }}
                        onBlur={() => setEditing(null)}
                        autoFocus
                      >
                        <option value="">Select driver…</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        type="button"
                        className="assign-link"
                        onClick={() => setEditing({ id: t.id, field: "driver" })}
                      >
                        <PersonAddAltOutlinedIcon style={{ fontSize: 20 }} />
                        <span>{t.driverName || "Assign"}</span>
                      </button>
                    )}
                  </td>

                  <td style={{ padding: "12px 8px" }}>
                    {isEditing(t.id, "trailer") ? (
                      <select
                        className="assign-select"
                        value={t.trailerId || ""}
                        onChange={(e) => {
                          const next = e.target.value;
                          if (next) onAssignTrailer?.(t.id, next);
                          setEditing(null);
                        }}
                        onBlur={() => setEditing(null)}
                        autoFocus
                      >
                        <option value="">Select trailer…</option>
                        {trailers.map((tr) => (
                          <option key={tr.id} value={tr.id}>
                            {tr.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        type="button"
                        className="assign-link"
                        onClick={() => setEditing({ id: t.id, field: "trailer" })}
                      >
                        <AddBoxOutlinedIcon style={{ fontSize: 20 }} />
                        <span>{t.trailerName || "Assign"}</span>
                      </button>
                    )}
                  </td>

                  <td style={{ padding: "12px 8px" }}>{formatDate(t.createdAt) || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TableFooter
        rowsPerPage={rowsPerPage}
        setRowsPerPage={handleSetRowsPerPage}
        page={page}
        setPage={setPage}
        total={trucks.length}
      />
    </div>
  );
}
