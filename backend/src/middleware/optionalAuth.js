import { supabaseAdmin } from "../config/supabaseClient.js";
import { verifyToken } from "../utils/jwt.js";
import { toPublicUser } from "../shared/sanitizeUser.js";

// Like requireAuth, but never rejects — GET endpoints stay public for
// everyone, this just attaches req.user when a valid token IS present, so
// handlers can compute per-viewer state (e.g. "did I already like this
// post") without gating the whole endpoint behind login.
export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = verifyToken(token);
    if (payload.purpose) return next();
    const { data: user } = await supabaseAdmin
      .from("users").select("*").eq("user_id", payload.user_id).maybeSingle();
    if (user && user.status === "active") req.user = toPublicUser(user);
  } catch {
    // Invalid/expired token on a public endpoint — proceed anonymously
    // rather than erroring; the caller didn't ask for auth to be required.
  }
  next();
}
