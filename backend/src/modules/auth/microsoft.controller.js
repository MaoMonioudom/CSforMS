import * as client from "openid-client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { supabaseAdmin, assertSupabaseConfigured } from "../../config/supabaseClient.js";
import { signToken, signPurposeToken, verifyToken } from "../../utils/jwt.js";
import { normalizeEmail, uniqueUserNameFromEmail } from "./auth.controller.js";

const SALT_ROUNDS = 10;

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

    // intent === "login": auto-provision if this Microsoft identity has never signed in before.
    if (!user) {
      // Comma-separated domains; subdomains count (cadt.edu.kh admits
      // student.cadt.edu.kh too).
      const allowedDomains = (process.env.MICROSOFT_ALLOWED_EMAIL_DOMAIN || "")
        .split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
      const emailDomain = email.split("@")[1] || "";
      const domainAllowed =
        allowedDomains.length === 0 ||
        allowedDomains.some((d) => emailDomain === d || emailDomain.endsWith(`.${d}`));
      if (!domainAllowed) {
        return res.redirect(frontendRedirect("/login", { error: "domain_not_allowed" }));
      }
      const user_name = await uniqueUserNameFromEmail(email);
      const password_hash = await bcrypt.hash(crypto.randomUUID(), SALT_ROUNDS);
      const { data: created, error: insertError } = await supabaseAdmin
        .from("users")
        .insert({
          full_name: name,
          email,
          user_name,
          password_hash,
          microsoft_id: msId,
          microsoft_linked_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (insertError) throw insertError;
      user = created;
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
