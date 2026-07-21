import { supabaseAdmin, assertSupabaseConfigured } from "../../config/supabaseClient.js";
import { toPublicUser } from "../../shared/sanitizeUser.js";

export async function getMe(req, res) {
  res.json({ data: req.user });
}

// Self-service profile edit — deliberately narrow: name/phone/bio/avatar
// only. Role/status/email/student_id aren't editable here (those are
// admin-controlled or identity-critical), so there's no need to guard
// individual fields beyond just not accepting them.
export async function updateMe(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const payload = {};
    if (req.body.full_name !== undefined) {
      const name = req.body.full_name.trim();
      if (!name) return res.status(400).json({ error: "Name can't be empty." });
      payload.full_name = name;
    }
    if (req.body.phone_number !== undefined) payload.phone_number = req.body.phone_number.trim() || null;
    if (req.body.bio !== undefined) payload.bio = req.body.bio.trim() || null;
    if (req.body.profile_img_url !== undefined) payload.profile_img_url = req.body.profile_img_url || null;

    const { data, error } = await supabaseAdmin
      .from("users")
      .update(payload)
      .eq("user_id", req.user.user_id)
      .select("*")
      .single();
    if (error) throw error;
    res.json({ data: toPublicUser(data) });
  } catch (err) {
    next(err);
  }
}

// Multipart upload — same pattern as event-images/achievement-icons: buffer
// straight to Supabase Storage, return the public URL for the edit form to
// save as profile_img_url via updateMe above.
export async function uploadMyAvatar(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    if (!req.file) return res.status(400).json({ error: "No image file provided (field name: avatar)" });
    const ext = (req.file.originalname.match(/\.\w+$/) || [".jpg"])[0].toLowerCase();
    const path = `avatars/${req.user.user_id}-${Date.now()}${ext}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from("user-avatars")
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (upErr) throw upErr;

    const { data } = supabaseAdmin.storage.from("user-avatars").getPublicUrl(path);
    res.status(201).json({ data: { url: data.publicUrl } });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { data, error } = await supabaseAdmin.from("users").select("*");
    if (error) throw error;
    res.json({ data: data.map(toPublicUser) });
  } catch (err) {
    next(err);
  }
}

// Suspend/reactivate — requireAuth already rejects a suspended account's
// own token on every subsequent request (see requireAuth.js), so toggling
// this is immediately effective, no separate enforcement needed here.
export async function setUserStatus(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const status = req.body.status;
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "status must be 'active' or 'inactive'" });
    }
    const targetId = Number(req.params.id);
    if (targetId === req.user.user_id) {
      return res.status(400).json({ error: "You can't change your own account status." });
    }
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({ status })
      .eq("user_id", targetId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "User not found" });
    res.json({ data: toPublicUser(data) });
  } catch (err) {
    next(err);
  }
}
