import { supabaseAdmin, assertSupabaseConfigured } from "../config/supabaseClient.js";
import { verifyToken } from "../utils/jwt.js";
import { toPublicUser } from "../shared/sanitizeUser.js";

// Verifies our own JWT (issued at signup/login), then loads the current row
// from `users` so req.user always reflects the latest role/status rather
// than whatever was true when the token was issued.
export async function requireAuth(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing bearer token" });

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("user_id", payload.user_id)
    .maybeSingle();
  if (error) return next(error);
  if (!user) return res.status(401).json({ error: "Account no longer exists" });
  if (user.status !== "active") return res.status(403).json({ error: "This account is inactive" });

  req.user = toPublicUser(user);
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}
