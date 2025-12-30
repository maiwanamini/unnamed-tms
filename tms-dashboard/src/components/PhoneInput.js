"use client";

import { useMemo } from "react";
import { useCountryCallingCodes } from "@/hooks/useCountryCallingCodes";
import SelectInput from "@/components/SelectInput";
import Image from "next/image";

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

  const parsed = useMemo(() => parsePhone(value, countries), [value, countries]);

  function emit(nextCode, nextNumber) {
    const combined = `${nextCode}${nextNumber ? ` ${nextNumber}` : ""}`.trim();
    onChange?.(combined);
  }


  const codeOptions = useMemo(() => {
    const list = Array.isArray(countries) ? countries : [];
    const opts = list.map((c) => {
      const code = String(c.code || "").trim();
      const name = String(c.name || "").trim();
      return {
        value: code,
        label: `${code}${name ? ` ${name}` : ""}`.trim(),
        countryName: name,
        flagPng: String(c.flagPng || ""),
        flagEmoji: String(c.flagEmoji || ""),
      };
    });

    // Ensure current (parsed) code is always selectable even if the API hasn't loaded yet.
    const currentCode = String(parsed.code || "").trim();
    if (currentCode && !opts.some((o) => o.value === currentCode)) {
      opts.unshift({ value: currentCode, label: currentCode });
    }

    // Provide a stable fallback while loading.
    if (!currentCode && opts.length === 0) {
      opts.unshift({ value: DEFAULT_CODE, label: DEFAULT_CODE });
    }

    return opts;
  }, [countries, parsed.code]);

  const renderFlag = (opt, size = 18) => {
    const flagPng = String(opt?.flagPng || "");
    const flagEmoji = String(opt?.flagEmoji || "");

    const boxStyle = {
      display: "inline-flex",
      width: 26,
      height: 16,
      justifyContent: "center",
      alignItems: "center",
      flex: "0 0 auto",
    };

    if (flagPng) {
      const src = flagSrc(flagPng, 80);
      return (
        <span style={boxStyle}>
          <Image
            src={src}
            width={20}
            height={14}
            alt=""
            style={{ width: 20, height: 14, borderRadius: 2, objectFit: "cover", display: "block" }}
          />
        </span>
      );
    }

    return (
      <span style={{ ...boxStyle, fontSize: size, lineHeight: "16px" }} aria-hidden="true">
        {flagEmoji || "🏳️"}
      </span>
    );
  };

  return (
    <div className="phone-input">
      <div style={{ flex: "0 0 auto" }}>
        <SelectInput
          bare
          showClear={false}
          value={parsed.code}
          onChange={(e) => {
            emit(String(e?.target?.value || DEFAULT_CODE), parsed.number);
          }}
          disabled={isLoading && (countries || []).length === 0}
          selectClassName="bg-transparent !border-0 rounded-none !shadow-none !ring-0 focus:!ring-0 focus-visible:!ring-0 outline-none focus:!outline-none w-auto h-full p-0 pl-3 !pr-3 !justify-start gap-2"
          renderValue={({ hasSelection, selectedOption }) => {
            const opt = selectedOption || { value: parsed.code, label: parsed.code };
            return (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {renderFlag(opt)}
                <span style={{ fontWeight: 600, lineHeight: "20px" }}>{hasSelection ? opt.value : parsed.code}</span>
              </span>
            );
          }}
          renderOption={(o) => (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              {renderFlag(o)}
              <span style={{ fontWeight: 600 }}>{String(o.value || "")}</span>
              <span style={{ color: "#6b7280" }}>{String(o.countryName || "")}</span>
            </span>
          )}
        >
          {codeOptions.map((o, idx) => (
            <option
              key={`${o.value}|${o.countryName || ""}|${idx}`}
              value={o.value}
              data-flag-png={o.flagPng}
              data-flag-emoji={o.flagEmoji}
              data-country-name={o.countryName}
            >
              {o.label}
            </option>
          ))}
        </SelectInput>
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
