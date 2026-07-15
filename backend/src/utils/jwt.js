import jwt from "jsonwebtoken";

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

export function signToken({ user_id, role }) {
  return jwt.sign({ user_id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN || "7d" });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// For tokens that aren't a normal session (OAuth `state`, password-reset
// links) — always carries a `purpose` so requireAuth can refuse to accept
// it as a bearer session token.
export function signPurposeToken(payload, expiresIn) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}
