import { Router } from "express";
import { supabaseAdmin, assertSupabaseConfigured } from "../../config/supabaseClient.js";
import { requireAuth, requireRole } from "../../middleware/requireAuth.js";
import { normalizeRow } from "../../shared/normalizeTimestamps.js";

// Action-based routes for `event_registrations` — not a plain table CRUD,
// so this doesn't go through crudRouter. Mounted at /events, alongside (and
// before) the generic events crudRouter in community.routes.js; every path
// here is at least two segments past /events (e.g. /:id/register,
// /registrations/me), so nothing collides with the generic router's single
// -segment /:id.
//
// Registration is intentionally one-way for the registrant: once you're in,
// there's no self-cancel — an admin has to remove you (see
// DELETE /:id/registrants/:userId below). This is a deliberate product
// decision, not an oversight.
const router = Router();

// Validation + capacity check + insert all happen in one DB transaction via
// register_for_event() (backend/supabase/009_atomic_event_registration.sql)
// — a plain JS "count, then check, then insert" can't be made race-free
// against two truly concurrent requests for the same event; the SQL
// function locks the event row instead, so a second concurrent call for the
// same event waits for the first instead of reading a stale count.
const REGISTER_ERROR_RESPONSES = {
  EVENT_NOT_FOUND: [404, "Event not found"],
  EVENT_CANCELLED: [400, "This event has been cancelled."],
  EVENT_STARTED: [400, "Registration is closed — this event has already started."],
  EVENT_FULL: [409, "This event is full."],
};

router.post("/:id/register", requireAuth, async (req, res, next) => {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const eventId = Number(req.params.id);
    const { error } = await supabaseAdmin.rpc("register_for_event", {
      p_event_id: eventId,
      p_user_id: req.user.user_id,
    });
    if (error) {
      const [status, message] = REGISTER_ERROR_RESPONSES[error.message] || [];
      if (status) return res.status(status).json({ error: message });
      throw error;
    }
    res.status(201).json({ data: { eventId, registered: true } });
  } catch (err) {
    next(err);
  }
});

// Event ids the caller is actively registered for — one call so the
// frontend can mark every event card without an N+1 fetch.
router.get("/registrations/me", requireAuth, async (req, res, next) => {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { data, error } = await supabaseAdmin
      .from("event_registrations")
      .select("event_id")
      .eq("user_id", req.user.user_id)
      .eq("participant_status", "registered");
    if (error) throw error;
    res.json({ data: data.map((r) => r.event_id) });
  } catch (err) {
    next(err);
  }
});

// Public, PII-free attendance counts for every event in one call.
router.get("/registrations/counts", async (req, res, next) => {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { data, error } = await supabaseAdmin
      .from("event_registrations")
      .select("event_id")
      .eq("participant_status", "registered");
    if (error) throw error;
    const counts = {};
    for (const r of data) counts[r.event_id] = (counts[r.event_id] || 0) + 1;
    res.json({ data: counts });
  } catch (err) {
    next(err);
  }
});

// Admin/staff-only: manually record someone who registered off-site (e.g.
// through an externally-hosted event's own form/link — see events.registration_url)
// so capacity/registrant tooling still reflects reality even though the
// sign-up itself happened outside this app. Looked up by email rather than
// user_id since that's what staff have on hand from an external form.
// Upsert (not insert) so re-adding someone who was previously removed
// (participant_status: "cancelled") reactivates their row instead of
// hitting the (user_id, event_id) unique constraint.
router.post("/:id/registrants", requireAuth, requireRole("admin", "staff"), async (req, res, next) => {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const eventId = Number(req.params.id);
    const email = (req.body.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ error: "email is required" });

    const { data: user, error: userErr } = await supabaseAdmin
      .from("users")
      .select("user_id, full_name, email, user_name")
      .ilike("email", email)
      .maybeSingle();
    if (userErr) throw userErr;
    if (!user) return res.status(404).json({ error: "No user found with that email" });

    const { error: upsertErr } = await supabaseAdmin
      .from("event_registrations")
      .upsert(
        { event_id: eventId, user_id: user.user_id, participant_status: "registered" },
        { onConflict: "user_id,event_id" }
      );
    if (upsertErr) throw upsertErr;

    res.status(201).json({ data: { userId: user.user_id, name: user.full_name, email: user.email } });
  } catch (err) {
    next(err);
  }
});

// Admin/staff-only: who's registered for one event, for the admin panel.
router.get("/:id/registrants", requireAuth, requireRole("admin", "staff"), async (req, res, next) => {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const eventId = Number(req.params.id);
    const { data, error } = await supabaseAdmin
      .from("event_registrations")
      .select("registration_date, user:users(user_id, full_name, email, user_name)")
      .eq("event_id", eventId)
      .eq("participant_status", "registered")
      .order("registration_date", { ascending: false });
    if (error) throw error;
    res.json({ data: data.map(normalizeRow) });
  } catch (err) {
    next(err);
  }
});

// Admin/staff-only: removes a specific registrant (e.g. a no-show freeing
// their spot for someone else) — the only way a registration goes away.
router.delete("/:id/registrants/:userId", requireAuth, requireRole("admin", "staff"), async (req, res, next) => {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const eventId = Number(req.params.id);
    const userId = Number(req.params.userId);
    const { error } = await supabaseAdmin
      .from("event_registrations")
      .update({ participant_status: "cancelled" })
      .eq("event_id", eventId)
      .eq("user_id", userId);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Admin/staff-only: bulk in-app notification to every active registrant.
router.post("/:id/remind", requireAuth, requireRole("admin", "staff"), async (req, res, next) => {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const eventId = Number(req.params.id);
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("title, start_date")
      .eq("event_id", eventId)
      .maybeSingle();
    if (eventError) throw eventError;
    if (!event) return res.status(404).json({ error: "Event not found" });

    const { data: registrants, error: regError } = await supabaseAdmin
      .from("event_registrations")
      .select("user_id")
      .eq("event_id", eventId)
      .eq("participant_status", "registered");
    if (regError) throw regError;

    if (!registrants.length) return res.json({ data: { sent: 0 } });

    const when = new Date(`${event.start_date}Z`).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      timeZone: "UTC", timeZoneName: "short",
    });
    const message = `Reminder: "${event.title}" starts ${when}.`;
    const rows = registrants.map((r) => ({
      user_id: r.user_id,
      message,
      notification_type: "event_reminder",
    }));
    const { error: insertError } = await supabaseAdmin.from("notifications").insert(rows);
    if (insertError) throw insertError;

    res.json({ data: { sent: rows.length } });
  } catch (err) {
    next(err);
  }
});

export default router;
