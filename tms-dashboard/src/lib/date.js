export function formatDateDDMMYYYY(value, { utc = true } = {}) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const dd = String(utc ? date.getUTCDate() : date.getDate()).padStart(2, "0");
  const mm = String((utc ? date.getUTCMonth() : date.getMonth()) + 1).padStart(2, "0");
  const yyyy = String(utc ? date.getUTCFullYear() : date.getFullYear());

  return `${dd}/${mm}/${yyyy}`;
}
