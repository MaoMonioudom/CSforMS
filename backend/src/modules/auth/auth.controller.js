import bcrypt from "bcrypt";
import { supabaseAdmin, assertSupabaseConfigured } from "../../config/supabaseClient.js";
import { signToken } from "../../utils/jwt.js";
import { toPublicUser } from "../../shared/sanitizeUser.js";

const SALT_ROUNDS = 10;

// Derives a unique user_name from the email's local part, e.g.
// "jane.doe@cadt.edu" -> "jane.doe", falling back to "jane.doe2",
// "jane.doe3", ... if that's already taken.
async function uniqueUserNameFromEmail(email) {
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

export async function signup(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { full_name, email, password } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: "full_name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("users")
      .select("user_id")
      .eq("email", email)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) return res.status(409).json({ error: "An account with this email already exists" });

    const user_name = await uniqueUserNameFromEmail(email);
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { data: user, error: insertError } = await supabaseAdmin
      .from("users")
      .insert({ full_name, email, user_name, password_hash })
      .select()
      .single();
    if (insertError) throw insertError;

    const token = signToken({ user_id: user.user_id, role: user.role });
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) return res.status(401).json({ error: "Invalid email or password" });
    if (user.status !== "active") return res.status(403).json({ error: "This account is inactive" });

    await supabaseAdmin.from("users").update({ last_login_at: new Date().toISOString() }).eq("user_id", user.user_id);

    const token = signToken({ user_id: user.user_id, role: user.role });
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}
