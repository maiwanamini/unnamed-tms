"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TableFooter from "@/components/TableFooter";
import TruckStatusPill from "@/components/TruckStatusPill";
import Tooltip from "@/components/Tooltip";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import PortalSelect from "@/components/PortalSelect";
import { formatDateDDMMYYYY } from "@/lib/date";
import { prettyTruckType } from "@/lib/vehicle";
import AvatarCircle from "@/components/AvatarCircle";

function Cell({ children }) {
  return <div className="table-cell-center">{children}</div>;
}

export default function TrucksTable({
  trucks = [],
  drivers = [],
  trailers = [],
  onAssignDriver,
  onAssignTrailer,
  onToggleStatus,
  selected,
  setSelected,
}) {
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
      { key: "type", label: "Type", width: 160 },
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
    <div className="w-full" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div
        className="table-wrapper"
        ref={wrapperRef}
        style={{ flex: "1 1 0%", minHeight: 0, overflowY: "auto", overflowX: "auto" }}
      >
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
                      padding: "8px 8px",
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
                <tr
                  key={t.id}
                  onClick={() => setSelected?.(t)}
                  className={selected?.id === t?.id ? "selected" : ""}
                  style={{ cursor: setSelected ? "pointer" : "default" }}
                >
                  <td style={{ padding: "12px 8px" }}>
                    <Cell>
                      <div>{t.licensePlate || ""}</div>
                    </Cell>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <Cell>
                      <div className="text-sm text-slate-900">{t.truck || ""}</div>
                    </Cell>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <Cell>{prettyTruckType(t?.type) || ""}</Cell>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <Cell>
                      <Tooltip
                        label={onToggleStatus ? "Change status" : ""}
                        wrapperProps={{ style: { display: "inline-flex" } }}
                      >
                        <button
                          type="button"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => {
                            if (!onToggleStatus) return;
                            const isInactive = String(t.status || "").toLowerCase() === "inactive";
                            onToggleStatus(t.id, isInactive ? "active" : "inactive");
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            padding: 0,
                            textAlign: "left",
                            cursor: onToggleStatus ? "pointer" : "default",
                          }}
                        >
                          <TruckStatusPill status={t.status} />
                        </button>
                      </Tooltip>
                    </Cell>
                  </td>

                  <td style={{ padding: "12px 8px" }}>
                    <Cell>
                      {isEditing(t.id, "driver") ? (
                        <PortalSelect
                          value={t.driverId || ""}
                          onChange={(v) => {
                            onAssignDriver?.(t.id, v || null);
                          }}
                          placeholder=""
                          options={drivers.map((d) => ({ value: d.id, label: d.name, avatarUrl: d.avatarUrl }))}
                          alwaysShowSearch
                          triggerClassName="assign-select assign-select-trigger"
                          menuClassName="status-dropdown assign-select-dropdown"
                          openOnMount
                          onClose={() => setEditing(null)}
                        />
                      ) : (
                        <button
                          type="button"
                          className="assign-link"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => setEditing({ id: t.id, field: "driver" })}
                        >
                          {t.driverName ? null : <PersonAddAltOutlinedIcon style={{ fontSize: 20 }} />}
                          {t.driverName ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                              <AvatarCircle
                                src={String(t?.driverAvatarUrl || "")}
                                name={String(t.driverName || "")}
                                seed={String(t.driverId || t.driverName || "")}
                                size={22}
                              />
                              <span className="truncate" style={{ minWidth: 0 }}>
                                {t.driverName}
                              </span>
                            </span>
                          ) : (
                            <span>Add driver</span>
                          )}
                        </button>
                      )}
                    </Cell>
                  </td>

                  <td style={{ padding: "12px 8px" }}>
                    <Cell>
                      {isEditing(t.id, "trailer") ? (
                        <PortalSelect
                          value={t.trailerId || ""}
                          onChange={(v) => {
                            onAssignTrailer?.(t.id, v || null);
                          }}
                          placeholder=""
                          options={trailers.map((tr) => ({ value: tr.id, label: tr.name }))}
                          alwaysShowSearch
                          triggerClassName="assign-select assign-select-trigger"
                          menuClassName="status-dropdown assign-select-dropdown"
                          openOnMount
                          onClose={() => setEditing(null)}
                        />
                      ) : (
                        <button
                          type="button"
                          className="assign-link"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => setEditing({ id: t.id, field: "trailer" })}
                        >
                          {t.trailerName ? null : <AddBoxOutlinedIcon style={{ fontSize: 20 }} />}
                          {t.trailerName ? <span>{t.trailerName}</span> : <span>Add trailer</span>}
                        </button>
                      )}
                    </Cell>
                  </td>

                  <td style={{ padding: "12px 8px" }}>
                    <Cell>{formatDateDDMMYYYY(t.createdAt) || ""}</Cell>
                  </td>
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
