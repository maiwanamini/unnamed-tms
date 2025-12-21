"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCountryCallingCodes } from "@/hooks/useCountryCallingCodes";

const DEFAULT_CODE = "+32";

function flagSrc(url, width) {
  if (!url) return "";
  return url.replace(/\/w\d+\//, `/w${width}/`);
}

function parsePhone(value, countries) {
  const v = (value || "").trim();
  if (!v) return { code: DEFAULT_CODE, number: "" };

  if (v.startsWith("+") && Array.isArray(countries) && countries.length > 0) {
    const match = countries
      .slice()
      .sort((a, b) => b.code.length - a.code.length)
      .find((c) => v.startsWith(c.code));

    if (match) {
      return { code: match.code, number: v.slice(match.code.length).trim() };
    }
  }

  return { code: DEFAULT_CODE, number: v };
}

export default function PhoneInput({ value, onChange, placeholder = "411 22 33 44" }) {
  const { countries, isLoading } = useCountryCallingCodes();

  const [open, setOpen] = useState(false);
  const [useEmojiOnly, setUseEmojiOnly] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef(null);

  const parsed = useMemo(() => parsePhone(value, countries), [value, countries]);

  useEffect(() => {
    function onDoc(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }

    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const selected = useMemo(() => {
    return countries.find((c) => c.code === parsed.code) || { flagEmoji: "", flagPng: "", name: "", code: parsed.code };
  }, [countries, parsed.code]);

  function emit(nextCode, nextNumber) {
    const combined = `${nextCode}${nextNumber ? ` ${nextNumber}` : ""}`.trim();
    onChange?.(combined);
  }

  function handlePick(next) {
    setOpen(false);
    emit(next.code, parsed.number);
  }

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const code = (c.code || "").toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [countries, search]);

  return (
    <div className="phone-input" ref={rootRef}>
      <div className={`custom-select ${open ? "open" : ""}`}>
        <button
          type="button"
          className="phone-prefix"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => {
            setOpen((s) => {
              const next = !s;
              if (next) setSearch("");
              return next;
            });
          }}
        >
          {selected.flagPng ? (
            useEmojiOnly ? (
              <span className="flag" aria-hidden="true">{selected.flagEmoji || "🏳️"}</span>
            ) : (
              <img
                className="flag-img"
                src={flagSrc(selected.flagPng, 80)}
                srcSet={`${flagSrc(selected.flagPng, 80)} 1x, ${flagSrc(selected.flagPng, 160)} 2x`}
                width={20}
                height={14}
                alt=""
                loading="lazy"
                decoding="async"
                onError={() => setUseEmojiOnly(true)}
              />
            )
          ) : (
            <span className="flag" aria-hidden="true">{selected.flagEmoji || "🏳️"}</span>
          )}
          <span className="phone-code">{selected.code}</span>
          <span className="custom-select-caret" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>

        {open && (
          <div className="phone-menu" role="listbox">
            <div className="phone-menu-search" role="presentation">
              <div className="search-box phone-menu-search-box">
                <span className="search-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.65" y1="16.65" x2="21" y2="21" />
                  </svg>
                </span>
                <input
                  className="search-input phone-menu-input"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country or code"
                  autoFocus
                />
              </div>
            </div>
            {isLoading && countries.length === 0 ? (
              <div className="custom-select-item">Loading…</div>
            ) : (
              filteredCountries.map((c) => (
                <div
                  key={`${c.name}-${c.code}`}
                  role="option"
                  aria-selected={c.code === parsed.code}
                  tabIndex={0}
                  className={`custom-select-item ${c.code === parsed.code ? "active" : ""}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handlePick(c);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handlePick(c);
                    }
                  }}
                >
                  <span style={{ display: "inline-flex", width: 32, justifyContent: "center", alignItems: "center" }}>
                    {c.flagPng ? (
                      useEmojiOnly ? (
                        <span aria-hidden="true">{c.flagEmoji || ""}</span>
                      ) : (
                        <img
                          className="flag-img"
                          src={flagSrc(c.flagPng, 80)}
                          srcSet={`${flagSrc(c.flagPng, 80)} 1x, ${flagSrc(c.flagPng, 160)} 2x`}
                          width={20}
                          height={14}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          onError={() => setUseEmojiOnly(true)}
                        />
                      )
                    ) : (
                      <span aria-hidden="true">{c.flagEmoji || ""}</span>
                    )}
                  </span>
                  <span style={{ fontWeight: 600, marginRight: 8 }}>{c.code}</span>
                  <span style={{ color: "#6b7280" }}>{c.name}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <input
        className="phone-number"
        placeholder={placeholder}
        value={parsed.number}
        onChange={(e) => {
          const next = e.target.value;
          emit(parsed.code, next);
        }}
      />
    </div>
  );
}
