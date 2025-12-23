const DEFAULT_API_BASE_URL = "https://unnamed-tms-backend.onrender.com/api";

export function getApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;
  return String(raw).replace(/\/+$/, "");
}

export function toApiUrl(input) {
  const url = String(input || "");
  if (/^https?:\/\//i.test(url)) return url;
  return `${getApiBaseUrl()}/${url.replace(/^\/+/, "")}`;
}

export const fetcher = async (input) => {
  const url = toApiUrl(input);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url} (${res.status})`);
  }
  return res.json();
};
