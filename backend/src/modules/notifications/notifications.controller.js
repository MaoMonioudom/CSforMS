import { supabaseAdmin, assertSupabaseConfigured } from "../../config/supabaseClient.js";
import { normalizeRow } from "../../shared/normalizeTimestamps.js";

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
