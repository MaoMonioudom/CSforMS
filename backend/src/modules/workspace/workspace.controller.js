import { supabaseAdmin, assertSupabaseConfigured } from "../../config/supabaseClient.js";
import { normalizeRow } from "../../shared/normalizeTimestamps.js";

const AUTHOR_COLS = "user_id, full_name, user_name, email, profile_img_url";
const LOCATION_COLS = "location_id, location_name, zone_name, shelf_code";
const WORKSPACE_COLS = `workspace_id, workspace_name, workspace_type, capacity, status, location:location_items(${LOCATION_COLS})`;

// Wall-clock labeled as UTC, same convention events already use (see
// events-data.js's formatEventDate) — no real timezone conversion.
function formatSlot(startIso, endIso) {
  const date = new Date(startIso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  const start = new Date(startIso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
  const end = new Date(endIso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
  return `${date}, ${start} – ${end}`;
}

// Desks/rooms open for booking — 'unavailable' ones (out for repair, etc.)
// are hidden entirely rather than shown disabled, since there's no admin UI
// yet to explain why one's off-limits.
export async function listWorkspaces(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { data, error } = await supabaseAdmin
      .from("workspaces")
      .select(WORKSPACE_COLS)
      .eq("status", "available")
      .order("workspace_id");
    if (error) throw error;
    res.json({ data: data.map(normalizeRow) });
  } catch (err) {
    next(err);
  }
}

// Bookings that block a slot on a given day — deliberately strips identity
// (no user join) since this only feeds the "already taken" grayed-out state
// on the member's availability grid, not a lookup of who booked what.
export async function listTakenSlots(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const date = req.query.date;
    if (!date) return res.status(400).json({ error: "date query param required" });
    const { data, error } = await supabaseAdmin
      .from("workspace_bookings")
      .select("workspace_id, start_time, end_time")
      .in("status", ["pending", "approved"])
      .gte("start_time", `${date}T00:00:00Z`)
      .lte("start_time", `${date}T23:59:59Z`);
    if (error) throw error;
    res.json({ data: data.map(normalizeRow) });
  } catch (err) {
    next(err);
  }
}

export async function listMyBookings(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { data, error } = await supabaseAdmin
      .from("workspace_bookings")
      .select(`*, workspace:workspaces(${WORKSPACE_COLS})`)
      .eq("user_id", req.user.user_id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ data: data.map(normalizeRow) });
  } catch (err) {
    next(err);
  }
}

// Up to the desk's capacity can share a (workspace, start_time) slot — this
// count gets re-checked here server-side, not just trusted from whatever
// availability the client already had loaded, so two members racing for the
// last spot in a slot can't both win it.
// Caps how many pending requests one member can have open at once — without
// this, a single member could submit a request for every slot on every
// desk (pending requests count toward capacity below, same as approved
// ones, so those slots would look full to everyone else) and lock the
// whole board until an admin manually works through the spam.
const PENDING_CAP = 3;

export async function createBooking(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { workspace_id, start_time, end_time } = req.body;
    if (!workspace_id || !start_time || !end_time) {
      return res.status(400).json({ error: "workspace_id, start_time, and end_time are required" });
    }

    const { data: myPending, error: pendingErr } = await supabaseAdmin
      .from("workspace_bookings")
      .select("booking_id")
      .eq("user_id", req.user.user_id)
      .eq("status", "pending");
    if (pendingErr) throw pendingErr;
    if (myPending.length >= PENDING_CAP) {
      return res.status(429).json({
        error: `You already have ${PENDING_CAP} pending requests — cancel one or wait for a decision before submitting more.`,
      });
    }

    const { data: workspace, error: wsError } = await supabaseAdmin
      .from("workspaces").select("capacity").eq("workspace_id", workspace_id).maybeSingle();
    if (wsError) throw wsError;
    if (!workspace) return res.status(404).json({ error: "Workspace not found" });

    const { data: existing, error: clashError } = await supabaseAdmin
      .from("workspace_bookings")
      .select("booking_id, user_id")
      .eq("workspace_id", workspace_id)
      .eq("start_time", start_time)
      .in("status", ["pending", "approved"]);
    if (clashError) throw clashError;
    // One request per person per (desk, slot), regardless of capacity — a
    // multi-person room has no reason to hold more than one seat for the
    // same person at the same time.
    if (existing.some((b) => b.user_id === req.user.user_id)) {
      return res.status(409).json({ error: "You already have a request for this slot." });
    }
    if (existing.length >= (workspace.capacity || 1)) {
      return res.status(409).json({ error: "That slot is fully booked — pick another." });
    }

    const { data, error } = await supabaseAdmin
      .from("workspace_bookings")
      .insert({ workspace_id, user_id: req.user.user_id, start_time, end_time })
      .select(`*, workspace:workspaces(${WORKSPACE_COLS})`)
      .single();
    if (error) throw error;
    res.status(201).json({ data: normalizeRow(data) });
  } catch (err) {
    next(err);
  }
}

// Self-service — a member cancelling their own still-pending request. Not
// available once it's been approved/denied (own the ownership + status
// check right in the query, rather than a separate lookup): frees both
// their spot in the PENDING_CAP above and the slot itself for others.
export async function cancelBooking(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { data, error } = await supabaseAdmin
      .from("workspace_bookings")
      .update({ status: "cancelled" })
      .eq("booking_id", req.params.id)
      .eq("user_id", req.user.user_id)
      .eq("status", "pending")
      .select("booking_id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Pending request not found" });
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
}

// Admin/staff only — every desk regardless of status, so a disabled one can
// still be found and re-enabled (listWorkspaces above only shows
// 'available' ones, for the member-facing booking grid).
export async function listAllWorkspaces(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { data, error } = await supabaseAdmin
      .from("workspaces")
      .select(WORKSPACE_COLS)
      .order("workspace_id");
    if (error) throw error;
    res.json({ data: data.map(normalizeRow) });
  } catch (err) {
    next(err);
  }
}

// location_id links to the same location_items table inventory storage
// spots use (System_Full_DB.sql's comment: "reuses location_items rather
// than inventing a second location concept") — optional, since not every
// desk needs a tracked physical location yet.
export async function createWorkspace(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const workspace_name = (req.body.workspace_name || "").trim();
    const workspace_type = (req.body.workspace_type || "").trim() || null;
    const location_id = req.body.location_id ? Number(req.body.location_id) : null;
    const capacity = req.body.capacity ? Number(req.body.capacity) : 1;
    if (!workspace_name) return res.status(400).json({ error: "workspace_name is required" });

    const { data, error } = await supabaseAdmin
      .from("workspaces")
      .insert({ workspace_name, workspace_type, location_id, capacity })
      .select(WORKSPACE_COLS)
      .single();
    if (error) throw error;
    res.status(201).json({ data: normalizeRow(data) });
  } catch (err) {
    next(err);
  }
}

// Soft on/off switch rather than delete — workspace_bookings has
// ON DELETE CASCADE on workspace_id, so hard-deleting a desk would silently
// wipe its whole booking history. Toggling status keeps that history intact
// and just stops it from showing up for new bookings.
export async function setWorkspaceStatus(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const status = req.body.status;
    if (!["available", "unavailable"].includes(status)) {
      return res.status(400).json({ error: "status must be 'available' or 'unavailable'" });
    }
    const { data, error } = await supabaseAdmin
      .from("workspaces")
      .update({ status })
      .eq("workspace_id", req.params.id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Workspace not found" });
    res.json({ data: normalizeRow(data) });
  } catch (err) {
    next(err);
  }
}

// Admin/staff only — every booking, newest first, with the requester's
// identity embedded (unlike listTakenSlots, which deliberately hides it).
// workspace_bookings has two FKs into users (user_id AND approved_by), so
// the plain "!user_id" hint is ambiguous to PostgREST (PGRST201) — has to
// be the full constraint name to pick the booker, not the approver.
export async function listAllBookings(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { data, error } = await supabaseAdmin
      .from("workspace_bookings")
      .select(`*, user:users!workspace_bookings_user_id_fkey(${AUTHOR_COLS}), workspace:workspaces(${WORKSPACE_COLS})`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ data: data.map(normalizeRow) });
  } catch (err) {
    next(err);
  }
}

// Shared by approve/reject below — stamps who decided it, then notifies the
// requester in-app (same notifications table/pattern the event-reminder
// feature already uses), so the two sides of this action are no longer
// stuck in separate browsers with no way to hear back from each other.
async function finalizeBooking(req, res, status, messageFor) {
  const { data, error } = await supabaseAdmin
    .from("workspace_bookings")
    .update({ status, approved_by: req.user.user_id })
    .eq("booking_id", req.params.id)
    .select(`user_id, start_time, end_time, workspace:workspaces(${WORKSPACE_COLS})`)
    .maybeSingle();
  if (error) throw error;
  if (!data) return res.status(404).json({ error: "Booking not found" });

  const { error: notifyError } = await supabaseAdmin.from("notifications").insert({
    user_id: data.user_id,
    message: messageFor(data.workspace?.workspace_name || "your workspace request", formatSlot(data.start_time, data.end_time)),
    notification_type: "workspace_booking",
  });
  if (notifyError) throw notifyError;

  res.json({ data: { ok: true } });
}

// Blocks approving past a desk's capacity — counts bookings already
// approved for the same (workspace, start_time), not counting this one, and
// re-checks it here rather than trusting whatever the admin's screen had
// loaded, so two admins approving near-simultaneously can't both push a
// slot over capacity.
export async function approveBooking(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { data: booking, error: findErr } = await supabaseAdmin
      .from("workspace_bookings")
      .select("workspace_id, start_time, workspace:workspaces(capacity)")
      .eq("booking_id", req.params.id)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const { data: approved, error: countErr } = await supabaseAdmin
      .from("workspace_bookings")
      .select("booking_id")
      .eq("workspace_id", booking.workspace_id)
      .eq("start_time", booking.start_time)
      .eq("status", "approved")
      .neq("booking_id", req.params.id);
    if (countErr) throw countErr;

    const capacity = booking.workspace?.capacity || 1;
    if (approved.length >= capacity) {
      return res.status(409).json({ error: "This slot is already full — can't approve any more requests for it." });
    }

    await finalizeBooking(req, res, "approved", (name, slot) => `Your request for ${name} (${slot}) was approved.`);
  } catch (err) {
    next(err);
  }
}

export async function rejectBooking(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    await finalizeBooking(req, res, "rejected", (name, slot) => `Your request for ${name} (${slot}) was denied.`);
  } catch (err) {
    next(err);
  }
}
