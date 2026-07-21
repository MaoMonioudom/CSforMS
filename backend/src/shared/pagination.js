// Parses ?page=&limit= into a Supabase .range() pair. Returns null when
// neither is present, so callers can fall back to their old "return
// everything" behavior — pagination is opt-in per request, not forced on
// every list endpoint (existing callers that never send these params, like
// inventory's items/filaments, are unaffected).
export function parsePagination(query, defaultLimit = 20, maxLimit = 100) {
  if (query.page == null && query.limit == null) return null;
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { page, limit, from, to };
}
