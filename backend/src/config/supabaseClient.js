import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY
);

// Anon-key client for public reads — respects RLS "select" policies.
export const supabasePublic = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })
  : null;

// Service-role client — bypasses RLS. Only for trusted server-side work
// (e.g. verifying a user's access token), never exposed to a request path
// that trusts arbitrary caller input.
export const supabaseAdmin = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

// Per-request client scoped to the caller's own access token, so writes
// are executed *as that user* and RLS policies apply normally.
export function supabaseForToken(accessToken) {
  if (!isSupabaseConfigured) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function assertSupabaseConfigured(res) {
  if (!isSupabaseConfigured) {
    res.status(503).json({
      error:
        "Supabase is not configured yet. Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in backend/.env",
    });
    return false;
  }
  return true;
}
