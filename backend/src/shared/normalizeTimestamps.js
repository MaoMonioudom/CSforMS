// Postgres `timestamp` (no time zone) columns come back from PostgREST as
// bare strings like "2026-07-14T12:36:04.759406" — no 'Z', no offset. The
// value IS UTC (CURRENT_TIMESTAMP on the Supabase server), but `new Date(...)`
// on an offset-less string assumes local time, so every "created X ago" is
// off by the viewer's UTC offset. Stamp the missing 'Z' back on before the
// row leaves the server so every consumer parses it correctly.
const BARE_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/;

// Recurses into nested objects/arrays (e.g. a borrow row's embedded
// `return_transactions` array from a Supabase join) — the bare-timestamp
// bug isn't limited to top-level columns.
export function normalizeRow(row) {
  if (Array.isArray(row)) {
    for (const item of row) normalizeRow(item);
    return row;
  }
  if (!row || typeof row !== "object") return row;
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === "string" && BARE_TIMESTAMP.test(value)) row[key] = `${value}Z`;
    else if (value && typeof value === "object") normalizeRow(value);
  }
  return row;
}
