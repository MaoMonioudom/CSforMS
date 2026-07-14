import { useCallback, useState } from "react";
import { getUserByEmail, getUserById } from "../../data/userStore";

const SESSION_KEY = "makerspace_session";

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Mock auth — there's no backend yet, so this checks email/password
 * against the seed + admin-created accounts (data/userStore.js) and
 * keeps the session in localStorage. Not secure; good enough to demo
 * the admin/lecturer access-control flow.
 */
export function useAuth() {
  const [session, setSession] = useState(readSession);

  const sessionUser = session ? getUserById(session.userId) : null;
  const currentUser = sessionUser && sessionUser.active !== false ? sessionUser : null;

  const login = useCallback((email, password) => {
    const user = getUserByEmail(email);
    if (!user || user.password !== password) {
      return { ok: false, error: "Incorrect email or password." };
    }
    if (user.active === false) {
      return { ok: false, error: "This account has been deactivated." };
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
    setSession({ userId: user.id });
    return { ok: true, user };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  return {
    currentUser,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === "admin",
    isLecturer: currentUser?.role === "lecturer",
    login,
    logout,
  };
}
