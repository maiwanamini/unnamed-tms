export function getInitials(name) {
  const n = String(name || "").trim();
  if (!n) return "";

  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";

  const a = parts[0]?.[0] || "";
  const b = parts.length > 1 ? parts[1]?.[0] || "" : parts[0]?.[1] || "";
  return `${String(a).toUpperCase()}${String(b).toUpperCase()}`.trim();
}

function hashStringToInt(input) {
  // Simple deterministic hash (djb2-ish)
  const s = String(input || "");
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  // force unsigned 32-bit
  return h >>> 0;
}

export function pickAvatarColor(seed) {
  // Use only colors already present elsewhere in globals.css (status colors).
  const palette = [
    "#111827", // slate-900
    "#075985", // cyan-800 (used by status-moving text)
    "#065f46", // emerald-800 (used by status-completed text)
    "#92400e", // amber-800 (used by status-pending text)
    "#9f1239", // rose-800 (used by status-canceled text)
  ];

  const h = hashStringToInt(seed);
  return palette[h % palette.length];
}
