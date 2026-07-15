import * as client from "openid-client";
import bcrypt from "bcrypt";
import { supabaseAdmin, assertSupabaseConfigured } from "../../config/supabaseClient.js";
import { signToken, signPurposeToken, verifyToken } from "../../utils/jwt.js";
import { normalizeEmail } from "./auth.controller.js";
import { uniqueUserNameFromEmail } from "../../shared/userAccounts.js";
import { toPublicUser } from "../../shared/sanitizeUser.js";

const SALT_ROUNDS = 10;

// Comma-separated domains; subdomains count (cadt.edu.kh admits
// student.cadt.edu.kh too). Shared by the callback's first-time-signup gate
// and complete-signup's defense-in-depth re-check.
function isDomainAllowed(email) {
  const allowedDomains = (process.env.MICROSOFT_ALLOWED_EMAIL_DOMAIN || "")
    .split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
  if (allowedDomains.length === 0) return true;
  const emailDomain = email.split("@")[1] || "";
  return allowedDomains.some((d) => emailDomain === d || emailDomain.endsWith(`.${d}`));
}

// Confidential (server-side) client — Microsoft is discovered/configured
// once and cached, not PKCE'd (PKCE is for public/browser clients; we hold
// a client secret here).
let configPromise;
function getConfig() {
  if (!configPromise) {
    const tenant = process.env.MICROSOFT_TENANT_ID || "common";
    configPromise = client.discovery(
      new URL(`https://login.microsoftonline.com/${tenant}/v2.0`),
      process.env.MICROSOFT_CLIENT_ID,
      process.env.MICROSOFT_CLIENT_SECRET
    );
  }
  return configPromise;
}

function frontendRedirect(path, params) {
  const url = new URL(path, process.env.FRONTEND_URL);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.href;
}

// Looks up a user by their linked Microsoft account, falling back to
// matching (and auto-linking) an existing row by email. Never creates a row.
async function findOrLinkUser({ msId, email }) {
  const normalizedEmail = normalizeEmail(email);
  const { data: byMsId, error: byMsIdError } = await supabaseAdmin
    .from("users").select("*").eq("microsoft_id", msId).maybeSingle();
  if (byMsIdError) throw byMsIdError;
  if (byMsId) return byMsId;

  if (!normalizedEmail) return null;
  const { data: byEmail, error: byEmailError } = await supabaseAdmin
    .from("users").select("*").eq("email", normalizedEmail).maybeSingle();
  if (byEmailError) throw byEmailError;
  if (!byEmail) return null;

  const { error: linkError } = await supabaseAdmin
    .from("users")
    .update({ microsoft_id: msId, microsoft_linked_at: new Date().toISOString() })
    .eq("user_id", byEmail.user_id);
  if (linkError) throw linkError;
  return { ...byEmail, microsoft_id: msId };
}

export async function microsoftLogin(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const intent = req.query.intent === "reset" ? "reset" : "login";
    // For resets the user already told us which account they're recovering
    // (forgotPasswordCheck) — carry that email in the signed state so the
    // callback can insist the Microsoft account actually matches it.
    const claimedEmail = intent === "reset" ? normalizeEmail(req.query.email) : undefined;
    if (intent === "reset" && !claimedEmail) {
      return res.redirect(frontendRedirect("/forgot-password", { error: "missing_email" }));
    }
    const cfg = await getConfig();
    const state = signPurposeToken({ intent, claimedEmail, purpose: "oauth_state" }, "10m");
    const url = client.buildAuthorizationUrl(cfg, {
      redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
      scope: "openid profile email",
      state,
    });
    res.redirect(url.href);
  } catch (err) {
    next(err);
  }
}

export async function microsoftCallback(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;

  const stateParam = req.query.state;
  let intent = "login";
  let claimedEmail;
  try {
    const statePayload = verifyToken(stateParam);
    if (statePayload.purpose !== "oauth_state") throw new Error("wrong purpose");
    intent = statePayload.intent;
    claimedEmail = statePayload.claimedEmail;
  } catch {
    return res.redirect(frontendRedirect(intent === "reset" ? "/forgot-password" : "/login", { error: "invalid_state" }));
  }

  try {
    const cfg = await getConfig();
    const currentUrl = new URL(req.originalUrl, process.env.MICROSOFT_REDIRECT_URI);
    const tokens = await client.authorizationCodeGrant(cfg, currentUrl, { expectedState: stateParam });
    const claims = tokens.claims();
    const msId = claims.oid || claims.sub;
    const email = normalizeEmail(claims.email || claims.preferred_username);
    const name = claims.name || email;

    if (!email) {
      return res.redirect(frontendRedirect(intent === "reset" ? "/forgot-password" : "/login", { error: "no_email" }));
    }

    if (intent === "reset" && email !== claimedEmail) {
      // They asked to recover one account but signed into Microsoft as
      // someone else — proving ownership of a *different* email doesn't count.
      return res.redirect(frontendRedirect("/forgot-password", { error: "email_mismatch" }));
    }

    let user = await findOrLinkUser({ msId, email });

    if (intent === "reset") {
      if (!user || user.status !== "active") {
        return res.redirect(frontendRedirect("/forgot-password", { error: user ? "inactive" : "no_account" }));
      }
      const resetToken = signPurposeToken({ user_id: user.user_id, purpose: "pwd_reset" }, "15m");
      return res.redirect(frontendRedirect("/reset-password", { token: resetToken }));
    }

    // intent === "login", no existing account: Microsoft only verified the
    // email here — it doesn't get to create the account too. Hand off to a
    // real signup form so the person picks their own name and password.
    if (!user) {
      if (!isDomainAllowed(email)) {
        return res.redirect(frontendRedirect("/login", { error: "domain_not_allowed" }));
      }
      const signupToken = signPurposeToken({ msId, email, name, purpose: "ms_signup" }, "15m");
      return res.redirect(frontendRedirect("/complete-signup", { token: signupToken, email, name }));
    }

    if (user.status !== "active") {
      return res.redirect(frontendRedirect("/login", { error: "inactive" }));
    }

    await supabaseAdmin.from("users").update({ last_login_at: new Date().toISOString() }).eq("user_id", user.user_id);
    const token = signToken({ user_id: user.user_id, role: user.role });
    return res.redirect(frontendRedirect("/auth/callback", { token }));
  } catch (err) {
    next(err);
  }
}

// Finishes the flow microsoftCallback started for a brand-new identity:
// Microsoft only proved the email is real, so full_name/password are the
// user's own choice, not Microsoft's claims. Plain JSON endpoint (not a
// redirect) since the frontend calls this directly from a form submit.
export async function microsoftCompleteSignup(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { token, full_name, password } = req.body;
    if (!full_name || !password) {
      return res.status(400).json({ error: "full_name and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return res.status(401).json({ error: "This signup link is invalid or has expired" });
    }
    if (payload.purpose !== "ms_signup") {
      return res.status(401).json({ error: "This signup link is invalid or has expired" });
    }
    const { msId, email } = payload;

    // The token could in theory outlive a domain-policy change in its 15
    // minute window — re-check rather than trust the token blindly.
    if (!isDomainAllowed(email)) {
      return res.status(403).json({ error: "That email isn't eligible to sign up here" });
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
      .insert({
        full_name,
        email,
        user_name,
        password_hash,
        microsoft_id: msId,
        microsoft_linked_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (insertError) throw insertError;

    const sessionToken = signToken({ user_id: user.user_id, role: user.role });
    res.status(201).json({ token: sessionToken, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}
