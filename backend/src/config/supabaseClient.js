import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY
);

// Anon-key client — used for reads that don't require our own auth (no RLS
// is defined on the app's tables, so this is a plain unauthenticated read).
export const supabasePublic = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })
  : null;

// Service-role client — bypasses RLS. Auth is handled entirely by our own
// requireAuth middleware (bcrypt + JWT against the `users` table), so this
// is the only client used for authenticated writes and for auth lookups.
export const supabaseAdmin = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

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
