import { supabaseAdmin, assertSupabaseConfigured } from "../../config/supabaseClient.js";
import { toPublicUser } from "../../shared/sanitizeUser.js";

export async function getMe(req, res) {
  res.json({ data: req.user });
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
