export function prettyTruckType(type) {
  const t = String(type || "").trim();
  if (!t) return "";

  // Keep labels short and user-friendly.
  if (t === "Rigid / box truck") return "Box truck";
  if (t === "Refrigerated (reefer) truck") return "Reefer truck";
  if (t === "Tip truck / dumper") return "Tipper";
  if (t === "Van (light commercial)") return "Van";
  return t;
}

export function prettyTrailerType(type) {
  const t = String(type || "").trim();
  if (!t) return "";

  // Normalize common casing.
  if (t.toLowerCase() === "dry van") return "Dry van";
  return t;
}

export function formatTruckLabel(truck) {
  const plate = String(truck?.licensePlate || truck?.plate || "").trim();
  const type = prettyTruckType(truck?.type);
  if (!plate) return "";
  if (!type) return plate;
  return `${plate} - ${type}`;
}

export function formatTrailerLabel(trailer) {
  const plate = String(trailer?.licensePlate || trailer?.plate || "").trim();
  const number = String(trailer?.trailerNumber || trailer?.number || "").trim();
  const type = prettyTrailerType(trailer?.type);

  if (!plate) return "";

  const tail = [number, type].filter(Boolean).join(" ").trim();
  if (!tail) return plate;
  return `${plate} - ${tail}`;
}
