import { supabaseAdmin, assertSupabaseConfigured } from "../../config/supabaseClient.js";
import { normalizeRow } from "../../shared/normalizeTimestamps.js";
import { runOverdueReminderJob } from "./overdueEmailReminders.js";

export async function listMyNotifications(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", req.user.user_id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ data: data.map(normalizeRow) });
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsRead(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", req.user.user_id)
      .eq("is_read", false);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("notification_id", req.params.id)
      .eq("user_id", req.user.user_id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Notification not found" });
    res.json({ data: normalizeRow(data) });
  } catch (err) {
    next(err);
  }
}

// Admin/staff-only — runs the same query and email content the daily cron
// job uses, but only logs + returns it as JSON. Nothing is actually sent
// yet (no Mail.Send permission wired up) — this is purely for the
// makerspace team to check the content/list is right before that's turned on.
export async function previewOverdueReminders(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const result = await runOverdueReminderJob();
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function deleteNotification(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("notification_id", req.params.id)
      .eq("user_id", req.user.user_id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Notification not found" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
