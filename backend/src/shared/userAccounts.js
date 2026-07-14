import { supabaseAdmin } from "../config/supabaseClient.js";

// Derives a unique user_name from the email's local part, e.g.
// "jane.doe@cadt.edu" -> "jane.doe", falling back to "jane.doe2",
// "jane.doe3", ... if that's already taken.
export async function uniqueUserNameFromEmail(email) {
  const base = email.split("@")[0].replace(/[^a-zA-Z0-9_.]/g, "").slice(0, 90) || "user";
  for (let suffix = 0; suffix < 50; suffix++) {
    const candidate = suffix === 0 ? base : `${base}${suffix + 1}`;
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("user_id")
      .eq("user_name", candidate)
      .maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
  }
  throw new Error("Could not derive a unique user_name");
}
