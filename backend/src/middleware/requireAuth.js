import { supabaseAdmin, supabaseForToken, assertSupabaseConfigured } from "../config/supabaseClient.js";

// Verifies the Supabase access token the frontend obtained via supabase-js,
// then attaches req.user (the auth user) and req.supabase (a client scoped
// to that user's token, so downstream queries run under their RLS policies).
export async function requireAuth(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing bearer token" });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: "Invalid or expired token" });

  req.user = data.user;
  req.supabase = supabaseForToken(token);
  next();
}
