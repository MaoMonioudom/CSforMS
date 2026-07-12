import { supabasePublic, assertSupabaseConfigured } from "../../config/supabaseClient.js";

export async function getMe(req, res, next) {
  try {
    const { data, error } = await req.supabase.from("profiles").select("*").eq("id", req.user.id).single();
    if (error) throw error;
    res.json({ data: { ...req.user, profile: data } });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { data, error } = await supabasePublic.from("profiles").select("*");
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
}
