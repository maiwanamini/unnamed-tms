"use client";

import { useEffect, useState } from "react";

const ENDPOINT = "https://restcountries.com/v3.1/all?fields=name,idd,flags,flag";

function normalizeCountries(data) {
  if (!Array.isArray(data)) return [];

  const out = [];
  for (const c of data) {
    const name = c?.name?.common || c?.name?.official || "";
    const flagEmoji = c?.flag || "";
    const flagPng = c?.flags?.png || "";
    const root = c?.idd?.root || "";
    const suffixes = Array.isArray(c?.idd?.suffixes) ? c.idd.suffixes : [];

    if (!name || !root) continue;

    if (suffixes.length === 0) {
      out.push({ name, flagEmoji, flagPng, code: root });
      continue;
    }

    for (const s of suffixes) {
      if (!s) continue;
      out.push({ name, flagEmoji, flagPng, code: `${root}${s}` });
    }
  }

  // de-dupe by name+code
  const seen = new Set();
  const deduped = [];
  for (const item of out) {
    const key = `${item.name}|${item.code}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  // stable sort: country name, then code
  deduped.sort((a, b) => {
    const n = a.name.localeCompare(b.name);
    if (n !== 0) return n;
    return a.code.localeCompare(b.code);
  });

  return deduped;
}

export function useCountryCallingCodes() {
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setIsLoading(true);
        setError(null);

        const cached = typeof window !== "undefined" ? window.sessionStorage.getItem("tms:countries:v2") : null;
        if (cached) {
          const parsed = JSON.parse(cached);
          const normalized = normalizeCountries(parsed);
          if (!cancelled) setCountries(normalized);
          // still revalidate in background
        }

        const res = await fetch(ENDPOINT);
        if (!res.ok) throw new Error(`Failed to load countries (${res.status})`);
        const json = await res.json();

        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("tms:countries:v2", JSON.stringify(json));
        }

        const normalized = normalizeCountries(json);
        if (!cancelled) setCountries(normalized);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { countries, isLoading, error };
}
