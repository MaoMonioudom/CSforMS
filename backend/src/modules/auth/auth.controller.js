import bcrypt from "bcrypt";
import { supabaseAdmin, assertSupabaseConfigured } from "../../config/supabaseClient.js";
import { signToken, verifyToken } from "../../utils/jwt.js";
import { toPublicUser } from "../../shared/sanitizeUser.js";

const SALT_ROUNDS = 10;

export const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

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

export async function signup(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { full_name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    if (!full_name || !normalizedEmail || !password) {
      return res.status(400).json({ error: "full_name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("users")
      .select("user_id")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) return res.status(409).json({ error: "An account with this email already exists" });

    const user_name = await uniqueUserNameFromEmail(normalizedEmail);
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { data: user, error: insertError } = await supabaseAdmin
      .from("users")
      .insert({ full_name, email: normalizedEmail, user_name, password_hash })
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
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", normalizedEmail)
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

// Step 1 of forgot-password: the user types their email and we confirm an
// account exists before sending them to Microsoft to prove they own it.
export async function forgotPasswordCheck(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email is required" });

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("user_id, status")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    if (error) throw error;
    if (!user) return res.status(404).json({ error: "We couldn't find an account with that email" });
    if (user.status !== "active") return res.status(403).json({ error: "This account is inactive. Contact an admin for help" });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// Completes the Microsoft-verified password-reset flow: the caller already
// proved their identity to get this token (see microsoft.controller.js), so
// on success we sign them straight back in rather than sending them to /login.
export async function resetPassword(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: "token and newPassword are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return res.status(401).json({ error: "This reset link is invalid or has expired" });
    }
    if (payload.purpose !== "pwd_reset") {
      return res.status(401).json({ error: "This reset link is invalid or has expired" });
    }

    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .update({ password_hash })
      .eq("user_id", payload.user_id)
      .select()
      .single();
    if (error) throw error;
    if (!user) return res.status(401).json({ error: "Account no longer exists" });

    const sessionToken = signToken({ user_id: user.user_id, role: user.role });
    res.json({ token: sessionToken, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}
