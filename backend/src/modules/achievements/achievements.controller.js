import { supabaseAdmin, assertSupabaseConfigured } from "../../config/supabaseClient.js";
import { normalizeRow } from "../../shared/normalizeTimestamps.js";
import { getUserActionCounts } from "../../shared/userActivityCounts.js";

// Every requirement_type maps to a real, countable thing a member has
// actually done — kept to a fixed list (rather than a free-text column, even
// though the DB allows any string) so the awarding logic later can dispatch
// on it safely instead of guessing what an arbitrary string means.
export const REQUIREMENT_TYPES = [
  "event_registrations",
  "course_enrollments",
  "borrows",
  "workspace_bookings",
  "community_posts",
  "collaboration_posts",
];

export async function listAchievements(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { data, error } = await supabaseAdmin
      .from("achievements")
      .select("*")
      .order("achievement_id");
    if (error) throw error;
    res.json({ data: data.map(normalizeRow) });
  } catch (err) {
    next(err);
  }
}

// The full catalog, annotated per-caller with earned/earned_at/progress.
// Newly-qualified badges are awarded (a real user_achievements row written)
// right here at read time — checked whenever the profile loads, rather
// than hooked into every action endpoint across every module.
export async function getMyAchievements(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const userId = req.user.user_id;
    const [{ data: achievements, error: achErr }, counts] = await Promise.all([
      supabaseAdmin.from("achievements").select("*").order("achievement_id"),
      getUserActionCounts(userId),
    ]);
    if (achErr) throw achErr;

    const { data: earned, error: earnedErr } = await supabaseAdmin
      .from("user_achievements")
      .select("achievement_id, earned_at")
      .eq("user_id", userId);
    if (earnedErr) throw earnedErr;
    const earnedMap = new Map(earned.map((e) => [e.achievement_id, e.earned_at]));

    const toAward = achievements.filter((a) =>
      !earnedMap.has(a.achievement_id) && (counts[a.requirement_type] ?? 0) >= a.requirement_value
    );
    if (toAward.length > 0) {
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from("user_achievements")
        .insert(toAward.map((a) => ({ user_id: userId, achievement_id: a.achievement_id })))
        .select("achievement_id, earned_at");
      if (insertErr) throw insertErr;
      for (const row of inserted) earnedMap.set(row.achievement_id, row.earned_at);
    }

    const result = achievements.map((a) => ({
      ...normalizeRow(a),
      earned: earnedMap.has(a.achievement_id),
      earned_at: earnedMap.get(a.achievement_id) ?? null,
      progress: Math.min(counts[a.requirement_type] ?? 0, a.requirement_value),
    }));
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function createAchievement(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const title = (req.body.title || "").trim();
    const requirement_type = req.body.requirement_type;
    const requirement_value = Number(req.body.requirement_value);
    if (!title) return res.status(400).json({ error: "title is required" });
    if (!REQUIREMENT_TYPES.includes(requirement_type)) {
      return res.status(400).json({ error: `requirement_type must be one of: ${REQUIREMENT_TYPES.join(", ")}` });
    }
    if (!Number.isInteger(requirement_value) || requirement_value < 1) {
      return res.status(400).json({ error: "requirement_value must be a positive whole number" });
    }

    const { data, error } = await supabaseAdmin
      .from("achievements")
      .insert({
        title,
        description: (req.body.description || "").trim() || null,
        icon_url: req.body.icon_url || null,
        requirement_type,
        requirement_value,
      })
      .select("*")
      .single();
    if (error) throw error;
    res.status(201).json({ data: normalizeRow(data) });
  } catch (err) {
    next(err);
  }
}

export async function updateAchievement(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const payload = {};
    if (req.body.title !== undefined) payload.title = req.body.title.trim();
    if (req.body.description !== undefined) payload.description = req.body.description.trim() || null;
    if (req.body.icon_url !== undefined) payload.icon_url = req.body.icon_url || null;
    if (req.body.requirement_type !== undefined) {
      if (!REQUIREMENT_TYPES.includes(req.body.requirement_type)) {
        return res.status(400).json({ error: `requirement_type must be one of: ${REQUIREMENT_TYPES.join(", ")}` });
      }
      payload.requirement_type = req.body.requirement_type;
    }
    if (req.body.requirement_value !== undefined) {
      const value = Number(req.body.requirement_value);
      if (!Number.isInteger(value) || value < 1) {
        return res.status(400).json({ error: "requirement_value must be a positive whole number" });
      }
      payload.requirement_value = value;
    }

    const { data, error } = await supabaseAdmin
      .from("achievements")
      .update(payload)
      .eq("achievement_id", req.params.id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Achievement not found" });
    res.json({ data: normalizeRow(data) });
  } catch (err) {
    next(err);
  }
}

// user_achievements has ON DELETE CASCADE on achievement_id — deleting an
// achievement from the catalog also wipes everyone's earned record for it.
// Acceptable here (removing a badge definition should remove it entirely),
// unlike workspaces/desks where we deliberately avoided a hard delete.
export async function deleteAchievement(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { error } = await supabaseAdmin.from("achievements").delete().eq("achievement_id", req.params.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// Admin/staff only — multipart upload, same pattern as event-images
// (community.routes.js): buffer straight to Supabase Storage, return the
// public URL for the create/edit form to save as icon_url.
export async function uploadAchievementIcon(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    if (!req.file) return res.status(400).json({ error: "No image file provided (field name: icon)" });
    const ext = (req.file.originalname.match(/\.\w+$/) || [".png"])[0].toLowerCase();
    const path = `achievements/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from("achievement-icons")
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (upErr) throw upErr;

    const { data } = supabaseAdmin.storage.from("achievement-icons").getPublicUrl(path);
    res.status(201).json({ data: { url: data.publicUrl } });
  } catch (err) {
    next(err);
  }
}
