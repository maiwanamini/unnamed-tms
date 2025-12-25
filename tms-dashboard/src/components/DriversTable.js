"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TableFooter from "@/components/TableFooter";
import TruckStatusPill from "@/components/TruckStatusPill";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
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

export default function DriversTable({ drivers = [], trucks = [], onAssignTruck }) {
  const wrapperRef = useRef(null);
  const [rowsPerPage, setRowsPerPage] = useState(Infinity);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null); // { id, field }

  const sortedDrivers = useMemo(() => {
    const rank = (value) => (String(value || "").toLowerCase() === "inactive" ? 1 : 0);
    return drivers
      .map((d, idx) => ({ d, idx }))
      .sort((a, b) => {
        const delta = rank(a.d.status) - rank(b.d.status);
        return delta !== 0 ? delta : a.idx - b.idx;
      })
      .map((x) => x.d);
  }, [drivers]);

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
  }, [drivers]);

  const handleSetRowsPerPage = (next) => {
    setRowsPerPage(next);
    setPage(0);
  };

  const columnDefs = useMemo(
    () => [
      { key: "fullName", label: "Full Name", width: 260 },
      { key: "status", label: "Status", width: 140 },
      { key: "phone", label: "Driver Phone", width: 170 },
      { key: "email", label: "Driver E-mail", width: 220 },
      { key: "truck", label: "Truck", width: 170 },
      { key: "createdAt", label: "Created At", width: 140 },
    ],
    []
  );

  const slice = useMemo(() => {
    if (rowsPerPage === Infinity) return sortedDrivers;
    const start = page * rowsPerPage;
    const end = Math.min(start + rowsPerPage, sortedDrivers.length);
    return sortedDrivers.slice(start, end);
  }, [sortedDrivers, page, rowsPerPage]);

  const isEditing = (id, field) => editing?.id === id && editing?.field === field;

  return (
    <div className="w-full">
      <div className="table-wrapper" ref={wrapperRef}>
        <div className="min-w-[1200px] inline-block align-top">
          <table
            className="orders-table w-full"
            style={{ borderCollapse: "separate", borderSpacing: 0, tableLayout: "fixed" }}
          >
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
              {slice.map((d) => (
                <tr key={d.id}>
                  <td style={{ padding: "12px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 9999,
                          background: "#ffffff",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          overflow: "hidden",
                        }}
                      >
                        {d.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={d.avatarUrl} alt="" style={{ width: 28, height: 28, objectFit: "cover" }} />
                        ) : (
                          <AccountCircleIcon style={{ fontSize: 28, color: "#e5e7eb" }} />
                        )}
                      </span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {d.fullName || ""}
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: "12px 8px" }}>
                    <TruckStatusPill status={d.status} />
                  </td>
                  <td style={{ padding: "12px 8px" }}>{d.phone || ""}</td>
                  <td style={{ padding: "12px 8px" }}>{d.email || ""}</td>

                  <td style={{ padding: "12px 8px" }}>
                    {isEditing(d.id, "truck") ? (
                      <select
                        className="assign-select"
                        value={d.truckId || ""}
                        onChange={(e) => {
                          const next = e.target.value;
                          if (next) onAssignTruck?.(d.id, next);
                          setEditing(null);
                        }}
                        onBlur={() => setEditing(null)}
                        autoFocus
                      >
                        <option value="">Select truck…</option>
                        {trucks.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button type="button" className="assign-link" onClick={() => setEditing({ id: d.id, field: "truck" })}>
                        <AddBoxOutlinedIcon style={{ fontSize: 18 }} />
                        <span>{d.truckName || "Assign"}</span>
                      </button>
                    )}
                  </td>

                  <td style={{ padding: "12px 8px" }}>{formatDate(d.createdAt) || ""}</td>
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
        total={drivers.length}
      />
    </div>
  );
}
