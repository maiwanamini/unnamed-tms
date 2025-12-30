"use client";

import { useEffect, useRef, useState } from "react";
import TableFooter from "@/components/TableFooter";
import { formatDateDDMMYYYY } from "@/lib/date";

function formatAddress(addr) {
  if (!addr) return "";
  if (typeof addr === "string") return addr;
  if (typeof addr === "object") {
    const parts = [
      addr.street,
      addr.line1,
      addr.line2,
      addr.city,
      addr.state,
      addr.postalCode,
      addr.zip,
      addr.country,
    ].filter(Boolean);
    return parts.join(", ");
  }
  return String(addr);
}

export default function CustomersTable({ customers = [], selected, setSelected }) {
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
  }, [customers]);

  const handleSetRowsPerPage = (next) => {
    setRowsPerPage(next);
    setPage(0);
  };

  const columnDefs = [
    { key: "name", label: "Full Name", width: 220 },
    { key: "contactName", label: "Contact Name", width: 180 },
    { key: "phone", label: "Contact Phone", width: 160 },
    { key: "email", label: "Contact E-mail", width: 240 },
    { key: "address", label: "Address", width: 260 },
    { key: "createdAt", label: "Created At", width: 140 },
  ];

  const getSlice = () => {
    if (rowsPerPage === Infinity) return customers;
    const start = page * rowsPerPage;
    const end = Math.min(start + rowsPerPage, customers.length);
    return customers.slice(start, end);
  };

  return (
    <div className="w-full" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div
        className="table-wrapper"
        ref={wrapperRef}
        style={{ flex: "1 1 0%", minHeight: 0, overflowY: "auto", overflowX: "auto" }}
      >
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
              {getSlice().map((c) => (
                <tr
                  key={c._id || c.id}
                  onClick={() => setSelected?.(c)}
                  className={selected?.id === c?.id ? "selected" : ""}
                  style={{ cursor: setSelected ? "pointer" : "default" }}
                >
                  <td style={{ padding: "12px 8px" }}>{c.name || ""}</td>
                  <td style={{ padding: "12px 8px" }}>{c.contactName || ""}</td>
                  <td style={{ padding: "12px 8px" }}>{c.phone || ""}</td>
                  <td style={{ padding: "12px 8px" }}>{c.email || ""}</td>
                  <td style={{ padding: "12px 8px" }}>{formatAddress(c.address) || ""}</td>
                  <td style={{ padding: "12px 8px" }}>{formatDateDDMMYYYY(c.createdAt || c.created_at) || ""}</td>
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
        total={customers.length}
      />
    </div>
  );
}
