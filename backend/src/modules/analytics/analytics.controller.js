import { supabaseAdmin, assertSupabaseConfigured } from "../../config/supabaseClient.js";

// Public — every page load records one row here (see frontend's route-change
// tracker in App.jsx). optionalAuth attaches req.user when a token is
// present so a logged-in visit carries who it was, but never blocks a guest.
export async function recordPageView(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const path = (req.body.path || "").slice(0, 255);
    if (!path) return res.status(400).json({ error: "path is required" });

    const { error } = await supabaseAdmin.from("page_views").insert({
      path,
      user_id: req.user?.user_id ?? null,
    });
    if (error) throw error;
    res.status(201).json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
}

// Admin/staff only — raw timestamps for the last N days, aggregated into
// daily counts on the frontend (same "fetch raw, derive client-side"
// pattern the rest of AdminDashboard's charts already use, rather than
// hand-rolling a GROUP BY through the Supabase query builder).
export async function listRecentPageViews(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const days = Math.min(90, Math.max(1, Number(req.query.days) || 30));
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from("page_views")
      .select("viewed_at")
      .gte("viewed_at", cutoff);
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
}
