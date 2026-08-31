import bcrypt from "bcrypt";
import { supabaseAdmin, assertSupabaseConfigured } from "../../config/supabaseClient.js";
import { signToken, verifyToken, signPurposeToken } from "../../utils/jwt.js";
import { toPublicUser } from "../../shared/sanitizeUser.js";

const SALT_ROUNDS = 10;

export const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

// Step 1 of "verify with Microsoft" sign-up: validates the form and hashes
// the password, but does NOT create the account yet — that only happens
// once the person actually proves they own this exact email by logging
// into it via Microsoft (see microsoft.controller.js's "signup_verify"
// intent). The pending signup (name/email/password hash) travels through
// that Microsoft round trip as a short-lived signed token rather than
// anything saved server-side, the same way the OAuth `state` param already
// carries data through a redirect elsewhere in this codebase.
export async function startVerifiedSignup(req, res, next) {
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

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const pendingToken = signPurposeToken(
      { full_name, email: normalizedEmail, password_hash, purpose: "pending_signup" },
      "15m"
    );
    res.json({ pendingToken });
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
