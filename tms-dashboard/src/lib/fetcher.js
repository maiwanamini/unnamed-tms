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

export function getAuthToken() {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("tms_token");
  } catch {
    return null;
  }
}

export async function apiFetch(input, init = {}) {
  const url = toApiUrl(input);
  const headers = new Headers(init.headers || {});

  // Only attach Authorization when a token exists.
  const token = getAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Default JSON handling when body is a plain object.
  let body = init.body;
  if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof Blob)) {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, { ...init, headers, body });
  } catch (e) {
    // Browser/network/CORS failures typically throw a TypeError like "Failed to fetch".
    const base = getApiBaseUrl();
    throw new Error(
      `Failed to reach API (${url}). Check NEXT_PUBLIC_API_BASE_URL (currently ${base}) and confirm the backend is running and reachable.`
    );
  }
  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    let details = "";
    let data;
    if (contentType.includes("application/json")) {
      try {
        data = await res.json();
        details = data?.message ? `: ${data.message}` : "";
      } catch {
        // ignore
      }
    }

    const err = new Error(`Request failed ${res.status} ${res.statusText}${details}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

export const fetcher = async (input) => {
  return apiFetch(input);
};
